
import re

with open("dist/index.html", "r") as file:
    data = file.read()

    x = re.search(
        '<script type="module" crossorigin src="/assets/(.*)"></script>', data)

with open("dist/assets/" + x.group(1), "r") as file:
    js = file.read()

new_html = data.replace(
    '<script type="module" crossorigin src="/assets/' + x.group(1) + '"></script>', '<script type="module" crossorigin>' + js + '</script>')

# with open("dist/indexold.html", "w") as file:
#     file.write(data)

with open("dist/index.html", "w") as file:
    file.write(new_html)
