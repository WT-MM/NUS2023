import unicodedata
import re

def slugify(value, allow_unicode=False):
    """
    Modified from https://github.com/django/django/blob/master/django/utils/text.py
    Convert to ASCII if 'allow_unicode' is False. Removes Spaces. Remove characters that aren't alphanumerics,
    underscores, or hyphens. Also strip leading and
    trailing whitespace, dashes, and underscores.
    """
    value = str(value)
    if allow_unicode:
        value = unicodedata.normalize('NFKC', value)
    else:
        value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value)
    return re.sub(r'[-\s]+', '', value).strip('-_')

filename = "Produce an artwork that seamlessly combines elements from the Cubist, Surrealist, and Pop Art movements, showcasing the distinctive characteristics and visual styles of each movement in a unified composition"


newfilename = slugify(filename) + ".txt"


with open(newfilename, "w", encoding="utf-8") as f:
    f.write(filename)
