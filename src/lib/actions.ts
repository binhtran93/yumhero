export function portal(node: HTMLElement) {
    let body = document.querySelector("body");
    body?.appendChild(node);

    return {
        destroy() {
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        }
    };
}
