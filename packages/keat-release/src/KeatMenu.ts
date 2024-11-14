import { createTemplate } from './native/utils/TemplateUtils';
import keatMenuHtml from './KeatMenu.html';
import keatMenuCss from './KeatMenu.css';
import { authenticate, getKeatConfig, toggle, type App } from './api';
import { MenuItem } from './native/MenuItem';
import { fromArrayLike, toggleAttribute } from './utils/component';

const template = createTemplate(keatMenuHtml, keatMenuCss);

type Step = 'connect' | 'browse' | 'toggle';

type KeatConfig = {
    features?: Record<string, any>;
    audiences?: Record<string, any>;
};
type KeatInstance = {
    get appId(): string | undefined;
    get config(): KeatConfig;
    refresh(): void;
};

class KeatMenu extends HTMLElement {
    private $instance: KeatInstance | undefined;
    private $app: App | undefined;
    private $step: Step = 'connect';
    private $input!: HTMLInputElement;

    private $list: HTMLUListElement;
    private $focus: number = 0;

    // Step: toggle
    private $features: string[] = [];
    private $audiences: string[] = [];
    private $navigating: boolean = false;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).appendChild(template().content.cloneNode(true));
        this.$list = this.shadowRoot?.querySelector('ul')!;
        this.$instance = (globalThis as any).__keat?.apps?.at(0);
    }

    showModal() {
        this.shadowRoot?.querySelector('dialog')?.showModal();
    }

    close() {
        this.shadowRoot?.querySelector('dialog')?.close();
    }

    get appId() {
        return this.$instance?.appId;
    }

    connectedCallback() {
        this.$input = this.shadowRoot?.querySelector('input')!;
        this.$input.addEventListener('keyup', () => {
            if (this.$step !== 'connect') {
                this.render();
            }
        });

        this.$input.addEventListener('keydown', (e) => {
            console.log('E', e);
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    if (this.$focus <= 0) return;
                    this.$focus -= 1;
                    this.render();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.$focus >= this.$list.children.length - 1) return;
                    this.$focus += 1;
                    this.$navigating = true;
                    this.render();
                    break;
                case 'Enter':
                    e.preventDefault();
                    switch (this.$step) {
                        case 'connect': {
                            console.log('TEST', this.appId);
                            if (!this.appId) return;
                            const v = this.$input.value;
                            this.fetchApp(this.appId, v).then(() => {
                                this.clear();
                                this.$step = 'browse';
                                this.render();
                            });
                            return;
                        }
                        case 'browse': {
                            this.$features = [fromArrayLike(this.$list.children as unknown as MenuItem[])[this.$focus].value];
                            this.clear();
                            this.$step = 'toggle';
                            this.render();
                            return;
                        }
                        case 'toggle': {
                            if (!this.appId) return;
                            this.$audiences = [fromArrayLike(this.$list.children as unknown as MenuItem[])[this.$focus].value];
                            this.toggleApp(this.appId).then(() => {
                                this.clear();
                                this.$features = [];
                                this.$audiences = [];
                                this.$step = 'browse';
                                this.render();
                            });
                            return;
                        }
                    }
                case ' ':
                    e.preventDefault();
                    // Toggle menu item if possible
                    switch (this.$step) {
                        case 'browse': {
                            if (this.$navigating) {
                                const current = fromArrayLike(this.$list.children as unknown as MenuItem[])[this.$focus].value;
                                const enabled = this.$features.some((a) => a === current);
                                if (enabled) {
                                    this.$features = this.$features.filter((a) => a !== current);
                                } else {
                                    this.$features.push(current);
                                }
                                this.render();
                            }
                        }
                        case 'toggle': {
                            if (this.$navigating) {
                                const current = fromArrayLike(this.$list.children as unknown as MenuItem[])[this.$focus].value;
                                const enabled = this.$audiences.some((a) => a === current);
                                if (enabled) {
                                    this.$audiences = this.$audiences.filter((a) => a !== current);
                                } else {
                                    this.$audiences.push(current);
                                }
                                this.render();
                            }
                        }
                    }

                    break;
            }
        });

        const appId = this.appId;
        const key = localStorage.getItem('__keat_key');
        if (appId && key) {
            this.fetchApp(appId);
        }
    }

    async fetchApp(appId: string, password?: string) {
        try {
            if (password) {
                const h = await authenticate(appId, password);
                localStorage.setItem('__keat_key', h);
            }
            this.$app = await getKeatConfig(appId);
            this.$input.value = '';
            this.$step = 'browse';
            this.$list.remove;
            this.render();
        } catch (err) {
            console.log('cannot fetch', (err as Error).message);
        }
    }

    async toggleApp(appId: string) {
        const feature = this.$features[0];
        this.$app = await toggle(appId, feature, this.$audiences);

        if (typeof this.$instance?.refresh === 'function') {
            this.$instance?.refresh();
        }
    }

    clear() {
        while (this.$list.firstChild) {
            this.$list.removeChild(this.$list.lastChild!);
        }
        this.$input.value = '';
        this.$focus = 0;
        this.$navigating = false;
    }

    render() {
        if (this.$step === 'connect') {
            return this.renderConnect();
        }
        if (this.$step === 'browse') {
            return this.renderBrowse();
        }
        if (this.$step === 'toggle') {
            return this.renderToggle();
        }
    }

    renderConnect() {
        this.$input.placeholder = this.appId ? 'Enter your password' : 'No Keat application found';
    }

    renderBrowse() {
        this.$input.placeholder = 'Search features…';
        let oldItems = fromArrayLike(this.$list.children as unknown as MenuItem[]);
        const remoteFeatures = this.$app?.features ?? [];
        const localFeatures = Object.keys(this.$instance?.config?.features ?? {});
        const allFeaturesSet = new Set(localFeatures);
        remoteFeatures.forEach((f) => allFeaturesSet.add(f.name));
        const allFeatures = [...allFeaturesSet];

        const newFeatures = allFeatures.filter((f) => f.toLowerCase().includes(this.$input.value.toLowerCase()));

        oldItems.forEach((oldItem) => {
            if (!newFeatures.some((f) => f === oldItem.value)) {
                this.$list.removeChild(oldItem);
            }
        });

        newFeatures.forEach((newFeature, i) => {
            if (!hasItemForValue(oldItems, newFeature)) {
                let newButton = new MenuItem(newFeature);
                toggleAttribute(newButton, 'focused', i === this.$focus);
                toggleAttribute(newButton, 'checked', this.$features.includes(newFeature));
                this.$list.appendChild(newButton);
            }
        });

        // update focus
        fromArrayLike(this.$list.children).forEach((item, i) => {
            toggleAttribute(item, 'focused', i === this.$focus);
        });

        fromArrayLike(this.$list.children).forEach((item, i) => {
            toggleAttribute(item, 'checked', this.$features.includes((item as MenuItem).value));
        });
    }

    renderToggle() {
        this.$input.placeholder = 'Search audiences…';
        let oldItems = fromArrayLike(this.$list.children as unknown as MenuItem[]);
        const remoteAudiences = this.$app?.audiences ?? [];
        const localAudiences = Object.keys(this.$instance?.config?.audiences ?? {});
        const allAudiencesSet = new Set(localAudiences);
        remoteAudiences.forEach((a) => allAudiencesSet.add(a.name));
        const allAudiences = [...allAudiencesSet];

        const newAudiences = allAudiences.filter((a) => a.toLowerCase().includes(this.$input.value.toLowerCase()));

        oldItems.forEach((oldItem) => {
            if (!newAudiences.some((a) => a === oldItem.value)) {
                this.$list.removeChild(oldItem);
            }
        });

        newAudiences.forEach((newAudience, i) => {
            if (!hasItemForValue(oldItems, newAudience)) {
                let newButton = new MenuItem(newAudience);
                toggleAttribute(newButton, 'focused', i === this.$focus);
                toggleAttribute(newButton, 'checked', this.$audiences.includes(newAudience));
                this.$list.appendChild(newButton);
            }
        });

        // update focus
        fromArrayLike(this.$list.children).forEach((item, i) => {
            toggleAttribute(item, 'focused', i === this.$focus);
        });
        fromArrayLike(this.$list.children).forEach((item, i) => {
            toggleAttribute(item, 'checked', this.$audiences.includes((item as MenuItem).value));
        });
    }
}

customElements.define('keat-menu', KeatMenu);

function hasItemForValue(items: readonly MenuItem[], value: string): boolean {
    return items.some((i) => i.value === value);
}
