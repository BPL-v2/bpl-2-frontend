import codecs
import os
from pathlib import Path
import struct
from dataclasses import dataclass
from typing import Literal, Optional, Union

import matplotlib.colors
from PIL import Image
import numpy as np

# Stuff to generate gem icons


@dataclass
class GemShadeConstants:
    hue_factor: float
    sat_factor: float
    val_factor: float
    lum_factor: float


def gemshade_constants_from_hex(hex_text: str):
    buf = codecs.decode(hex_text.replace(' ', ''), 'hex')
    return GemShadeConstants(*struct.unpack('<ffff', buf))



SHADE_LUT: dict[(str, str), GemShadeConstants] = {
    ('str', "alt_x"): gemshade_constants_from_hex('60 E5 50 BD 6F 12 83 BD 4E 62 90 3E 08 AC 1C 3F'),
    ('str', "alt_y"): gemshade_constants_from_hex('60 E5 50 BE B6 F3 7D 3E 33 33 B3 BE BA 49 4C 3F'),
    ('dex', "alt_x"): gemshade_constants_from_hex('9A 99 19 BE F4 FD 54 BD D1 22 5B 3E F0 A7 46 3F'),
    ('dex', "alt_y"): gemshade_constants_from_hex('B8 1E 85 3E 0A D7 A3 3D 19 04 16 BF 23 DB 39 3F'),
    ('int', "alt_x"): gemshade_constants_from_hex('AE 47 E1 BD AE 47 61 BE 0A D7 23 BD 00 00 80 3F'),
    ('int', "alt_y"): gemshade_constants_from_hex('8F C2 75 3D 0A D7 23 3D 0A D7 A3 BD 00 00 80 3F'),
}


def _srgb_to_linear(img):
    return np.piecewise(img,
                        [img <= 0.04045, img > 0.04045],
                        [lambda v: v / 12.92, lambda v: ((v + 0.055) / 1.055) ** 2.4])


def _linear_to_srgb(img):
    return np.piecewise(img,
                        [img <= 0.0031308, img > 0.0031308],
                        [lambda v: v * 12.92, lambda v: 1.055 * v ** (1.0 / 2.4) - 0.055])


color2attribute = {
    "g": "dex",
    "b": "int",
    "r": "str"
}


def generate_flask_image(base_image: Union[str, bytes, Path], game_version: str, rarity: str):
    with Image.open(base_image) as img:
        if game_version == "poe1":

            top = img.crop((0, 0, 78, 156))
            middle = img.crop((78, 0, 2 * 78, 156))
            bottom = img.crop((2 * 78, 0, 3 * 78, 156))
        else:
            top = img.crop((0, 0, 105, 212))
            middle = img.crop((105, 0, 2 * 105, 212))
            bottom = img.crop((2 * 105, 0, 3 * 105, 212))

        return Image.alpha_composite(Image.alpha_composite(bottom, middle), top)


def generate_gem_image(base_image: Union[str, bytes, Path], color: Optional[str], discriminator: Optional[Literal["alt_x", "alt_y", "alt_z"]]):
    with Image.open(base_image) as img:
        adorn = img.crop((0, 0, 78, 78))
        base = img.crop((2 * 78, 0, 3 * 78, 78))

        shifted_base = shift_base_image(base, color, discriminator)
        if discriminator == "alt_z":
            shifted_base = add_sparkles(shifted_base)
        return Image.alpha_composite(shifted_base, adorn)


def add_sparkles(base_image: Image.Image):
    with open(os.path.join(os.path.dirname(__file__), "sparklebackground.png"), "rb") as f:
        sparkles = Image.open(f)
        return Image.alpha_composite(sparkles, base_image)

def shift_base_image(base_image: Image.Image, color: str, discriminator: Optional[Literal["alt_x", "alt_y", "alt_z"]]):
        attribute = color2attribute.get(color)
        if discriminator is None or discriminator == "alt_z" or attribute is None:
            return base_image
        const = SHADE_LUT[(attribute, discriminator)]

        base_rgba = _srgb_to_linear(
            np.float64(np.asarray(base_image)) / 255.0)

        # Shade algorithm:
        # * compute luminance influence
        #   float Luminance(float3 color)
        #   {
        #   	return dot(float3(0.299, 0.587, 0.114), color);
        #   }
        # 	const float luminance_influence = pow(Luminance(original_rgb), 0.02);
        base_rgb = base_rgba[:, :, :3]
        base_a = base_rgba[:, :, 3]
        lum_f = base_rgba[:, :, 0] * 0.2999 + base_rgba[:,
                                                        :, 1] * 0.587 + base_rgba[:, :, 2] * 0.114
        lum_f = np.expand_dims(lum_f, axis=2)
        luminance_influence = lum_f ** 0.02

        # * convert to HSV
        # Not using the same algorithm, leveraging matplotlib
        hsv = matplotlib.colors.rgb_to_hsv(base_rgb)

        # * shift HSV by XYZ, clamp H
        # 	max(modf( hsv_sample.x + effect_params.x, ignore ), 0.024),
        # 	saturate( hsv_sample.y + effect_params.y ),
        # 	saturate( hsv_sample.z + effect_params.z )
        h2 = np.maximum(
            np.modf(hsv[:, :, 0] + const.hue_factor)[0], 0.024)
        s2 = np.clip(hsv[:, :, 1] + const.sat_factor, 0.0, 1.0)
        v2 = np.clip(hsv[:, :, 2] + const.val_factor, 0.0, 1.0)

        # * convert to "modified" RGB
        # Not using the same HSV algorithm, leveraging matplotlib
        modified_rgb = matplotlib.colors.hsv_to_rgb(
            np.stack([h2, s2, v2], axis=2))

        # * mix original RGB and modified RGB by luminance influence weighted by W
        # 	const float3 final_rgb = lerp(
        # 		modified_rgb,
        # 		original_rgb,
        # 		lerp(luminance_influence, 0.f, effect_params.w)
        # 	);
        def lerp(a, b, f):
            return a * (1. - f) + b * f

        final_mix_f = lerp(luminance_influence, 0., const.lum_factor)
        final_rgb = lerp(
            modified_rgb,
            base_rgb,
            final_mix_f)

        shifted_rgba = _linear_to_srgb(np.dstack((final_rgb, base_a)))
        shifted_base = Image.fromarray(
            np.uint8(shifted_rgba * 255.), 'RGBA')
        return shifted_base
