export function createTemplate(html: string, css?: string): () => HTMLTemplateElement {
    let template: HTMLTemplateElement | undefined;
    return () => {
        if (template === undefined) {
            template = document.createElement('template');
            template.innerHTML = css ? `<style>${css}</style>${html}` : html;
            html = undefined!;
        }
        return template;
    };
}
