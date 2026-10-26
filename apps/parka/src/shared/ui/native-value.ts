type TextControl = HTMLInputElement | HTMLTextAreaElement;

/** Sets the value through the native setter so React `onChange` runs. */
export const setNativeValue = (el: TextControl, value: string) => {
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
};
