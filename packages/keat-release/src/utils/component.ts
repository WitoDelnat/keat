export function setTextContent(el: HTMLElement, text: string): void {
    if (typeof el.textContent === 'undefined') {
        el.innerText = text;
    } else {
        el.textContent = text;
    }
}

export function toggleAttribute(element: Element, attribute: string, enabled: boolean): void {
    if (enabled) {
        element.setAttribute(attribute, '');
    } else {
        element.removeAttribute(attribute);
    }
}

export const fromArrayLike: <T>(arrayLike: ArrayLike<T>) => T[] =
    typeof Array.from === 'function'
        ? (arrayLike) => {
              return Array.from(arrayLike);
          }
        : (arrayLike) => {
              return Array.prototype.slice.call(arrayLike);
          };
