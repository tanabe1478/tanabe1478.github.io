// Copy buttons and Mermaid diagrams for the blocks that scripts/highlight
// writes. Loaded as a module only on pages that have such blocks.

const COPY_RESET_MS = 1500;

for (const button of document.querySelectorAll(".code-copy")) {
  button.addEventListener("click", async () => {
    const code = button.closest(".code-block").querySelector("pre").textContent;
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "コピーしました";
    } catch {
      button.textContent = "コピーできません";
    }
    setTimeout(() => {
      button.textContent = "コピー";
    }, COPY_RESET_MS);
  });
}

const blocks = [...document.querySelectorAll(".mermaid-block")];
if (blocks.length > 0) {
  const { default: mermaid } = await import("/vendor/mermaid/mermaid.esm.min.mjs");
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  let renderCount = 0;

  // The diagram uses the same design tokens as the page, read at render time
  // so the dark theme gets its own colors.
  const renderAll = async () => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      themeVariables: {
        fontFamily: css("--font-family-sans"),
        fontSize: "14px",
        background: css("--color-background"),
        primaryColor: css("--color-diagram-node"),
        primaryTextColor: css("--color-text"),
        primaryBorderColor: css("--color-accent"),
        secondaryColor: css("--color-diagram-node"),
        tertiaryColor: css("--color-diagram-node"),
        lineColor: css("--color-text-secondary"),
        textColor: css("--color-text"),
        clusterBkg: css("--color-code-surface"),
        clusterBorder: css("--color-border"),
        edgeLabelBackground: css("--color-background"),
      },
    });
    for (const block of blocks) {
      const source = block.querySelector(".mermaid-source").textContent;
      renderCount += 1;
      const { svg } = await mermaid.render(`mermaid-${renderCount}`, source);
      block.querySelector(".mermaid-diagram").innerHTML = svg;
    }
  };

  const show = (block, view) => {
    block.querySelector(".mermaid-diagram").hidden = view !== "diagram";
    block.querySelector(".mermaid-source").hidden = view !== "code";
    for (const button of block.querySelectorAll(".mermaid-toggle button")) {
      button.setAttribute("aria-pressed", String(button.dataset.view === view));
    }
  };

  try {
    await renderAll();
    for (const block of blocks) {
      const toggle = block.querySelector(".mermaid-toggle");
      toggle.hidden = false;
      toggle.addEventListener("click", (event) => {
        const view = event.target.closest("button")?.dataset.view;
        if (view) show(block, view);
      });
      show(block, "diagram");
    }
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      renderAll().catch((error) => console.error("Mermaid could not redraw", error));
    });
  } catch (error) {
    // Keep showing the source when a diagram cannot be drawn.
    console.error("Mermaid could not render", error);
  }
}
