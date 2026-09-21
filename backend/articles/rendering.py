"""Markdown → sanitised HTML. Markdown is the source of truth; HTML is derived."""

import nh3
from markdown_it import MarkdownIt
from mdit_py_plugins.footnote import footnote_plugin
from mdit_py_plugins.tasklists import tasklists_plugin

_md = (
    MarkdownIt("commonmark", {"linkify": False, "typographer": True})
    .enable(["table", "strikethrough"])
    .use(footnote_plugin)
    .use(tasklists_plugin)
)

ALLOWED_TAGS = {
    "a", "abbr", "b", "blockquote", "br", "code", "del", "div", "em", "figcaption", "figure",
    "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "input", "li", "mark", "ol", "p",
    "pre", "s", "section", "span", "strong", "sub", "sup", "table", "tbody", "td", "th",
    "thead", "tr", "u", "ul",
}  # fmt: skip
ALLOWED_ATTRIBUTES = {
    "a": {"href", "title", "id"},
    "img": {"src", "alt", "title", "width", "height"},
    "input": {"type", "checked", "disabled"},
    "li": {"id", "class"},
    "ul": {"class"},
    "ol": {"start"},
    "th": {"align", "style"},
    "td": {"align", "style"},
    "code": {"class"},
    "sup": {"class", "id"},
    "section": {"class"},
    "hr": {"class"},
}


def render_markdown(markdown: str) -> str:
    html = _md.render(markdown or "")
    return nh3.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        url_schemes={"http", "https", "mailto", "tel"},
        link_rel="noopener noreferrer",
        filter_style_properties={"text-align"},
    )
