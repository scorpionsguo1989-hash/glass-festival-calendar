"""Pack the production build into a single HTML file."""
import argparse
import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist" / "client"


def inline_script(match):
    source = (DIST / match[1]).read_text(encoding="utf-8")
    return '<script type="module">\n' + source.replace("</script", r"<\/script") + "\n</script>"


def inline_css(match):
    source = (DIST / match[1]).read_text(encoding="utf-8")

    def embed_asset(asset):
        path = DIST / asset[1]
        mime = {"woff2": "font/woff2", "svg": "image/svg+xml"}[path.suffix[1:]]
        content = base64.b64encode(path.read_bytes()).decode("ascii")
        return f"url(data:{mime};base64,{content})"

    source, files = re.subn(r"""url\(["']?/?((?:type|icons)/[^)"']+)["']?\)""", embed_asset, source)
    if files != 4:
        raise ValueError(f"Expected two fonts and two icons, found {files} style assets.")
    return "<style>\n" + source + "\n</style>"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "dist" / "glass-festival-calendar.html")
    output = parser.parse_args().output
    html = (DIST / "index.html").read_text(encoding="utf-8")
    html, scripts = re.subn(r'<script type="module" crossorigin src="/([^"]+)"></script>', inline_script, html)
    html, styles = re.subn(r'<link rel="stylesheet" crossorigin href="/([^"]+)">', inline_css, html)
    if (scripts, styles) != (1, 1):
        raise ValueError(f"Expected one compiled JS and CSS file, found {scripts} and {styles}.")

    notices = [
        "LICENSE",
        "public/type/host-grotesk-OFL.txt",
        "public/type/geist-mono-OFL.txt",
        "public/icons/LICENSE.txt",
        "node_modules/react/LICENSE",
        "node_modules/react-dom/LICENSE",
        "node_modules/scheduler/LICENSE",
        "node_modules/lunar-javascript/LICENSE",
    ]
    licenses = "\n\n".join((ROOT / name).read_text(encoding="utf-8").strip() for name in notices)
    html = html.replace("</body>", '<script type="text/plain" id="licenses">\n' + licenses + "\n</script>\n</body>")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(html, encoding="utf-8")
    print(f"{output}: {output.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
