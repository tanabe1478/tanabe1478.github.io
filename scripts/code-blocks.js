// Copy buttons and the Mermaid 図 / コード toggle for the blocks that
// scripts/highlight writes. Loaded only on pages that have such blocks.

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

// Diagrams are drawn at build time; here only the 図 / コード toggle is wired up.
for (const block of document.querySelectorAll(".mermaid-block")) {
  const diagram = block.querySelector(".mermaid-diagram");
  if (!diagram.querySelector("svg")) continue;
  const source = block.querySelector(".mermaid-source");
  const toggle = block.querySelector(".mermaid-toggle");
  toggle.hidden = false;
  toggle.addEventListener("click", (event) => {
    const view = event.target.closest("button")?.dataset.view;
    if (!view) return;
    diagram.hidden = view !== "diagram";
    source.hidden = view !== "code";
    for (const button of toggle.querySelectorAll("button")) {
      button.setAttribute("aria-pressed", String(button.dataset.view === view));
    }
  });
}
