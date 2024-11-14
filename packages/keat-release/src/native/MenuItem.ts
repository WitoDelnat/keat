import { setTextContent } from '../utils/component';
import menuItemHtml from './MenuItem.html';
import menuItemCss from './MenuItem.css';
import { createTemplate } from './utils/TemplateUtils';

const template = createTemplate(`<style>${menuItemCss}</style>${menuItemHtml}`);

export class MenuItem extends HTMLElement {
    private $value: string;

    constructor(value: string) {
        super();

        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template().content.cloneNode(true));

        const slot = this.shadowRoot!.querySelector('slot')!;
        setTextContent(slot, value);
        this.$value = value;
    }

    get value(): string {
        return this.$value;
    }
}

customElements.define('keat-menu-item', MenuItem);

declare global {
    interface HTMLElementTagNameMap {
        'keat-menu-item': MenuItem;
    }
}
