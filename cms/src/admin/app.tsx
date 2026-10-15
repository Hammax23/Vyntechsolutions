export default {
  config: {
    locales: ["en"],
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "VynTech CMS",
        "app.components.LeftMenu.navbrand.workplace": "Content Hub",
      },
    },
  },
  bootstrap() {
    // Rich-text editor: keep content readable in Strapi's dark theme
    // (pasted text carries its own dark colours, so override them).
    const style = document.createElement("style");
    style.id = "vyntech-editor-dark";
    document.head.appendChild(style);
    const DARK_CSS = `
      .ck.ck-editor__editable, .ck.ck-editor__editable *:not(a):not(svg):not(path) { color: #ffffff !important; }
      .ck.ck-editor__editable ul, .ck.ck-editor__editable ol, .ck.ck-editor__editable li { --ck-content-list-marker-color: #ffffff !important; }
      .ck.ck-editor__editable ul li::marker, .ck.ck-editor__editable ol li::marker, .ck.ck-editor__editable li::marker { color: #ffffff !important; }
      .ck.ck-editor__editable .todo-list .todo-list__label > input::before { border-color: #ffffff !important; }
      .ck.ck-editor__editable.ck-content a, .ck.ck-editor__editable.ck-content a *:not(svg):not(path) { color: #4da6ff !important; text-decoration: underline !important; text-underline-offset: 2px; }
      .ck.ck-editor__editable.ck-content a:hover, .ck.ck-editor__editable.ck-content a:hover *:not(svg):not(path) { color: #80c0ff !important; }
      .ck.ck-editor__editable th, .ck.ck-editor__editable td { border-color: rgba(255,255,255,.35) !important; }
      .ck.ck-editor__editable blockquote { border-left-color: rgba(125,196,255,.6) !important; }
      .ck.ck-editor__editable code, .ck.ck-editor__editable pre { background: rgba(255,255,255,.1) !important; }
    `;
    const LIGHT_CSS = `
      .ck.ck-editor__editable.ck-content a, .ck.ck-editor__editable.ck-content a *:not(svg):not(path) { color: #0055ff !important; text-decoration: underline !important; text-underline-offset: 2px; }
    `;
    const apply = () => {
      let theme = "light";
      try {
        theme = localStorage.getItem("STRAPI_THEME") || "system";
      } catch {
        /* ignore */
      }
      const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      const next = dark ? DARK_CSS : LIGHT_CSS;
      if (style.textContent !== next) style.textContent = next;
    };
    apply();
    window.setInterval(apply, 1000);
  },
};
