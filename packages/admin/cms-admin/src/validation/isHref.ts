import { isEmail, isURL } from "class-validator";

const PHONE_NUMBER_REGEX = /^\+?[0-9\s]+$/;

export function isHref(value: string): boolean {
    if (value.startsWith("mailto:")) {
        return isEmail(value.slice(7));
    } else if (value.startsWith("tel:")) {
        return PHONE_NUMBER_REGEX.test(value.slice(4));
    } else {
        return isURL(value, { require_protocol: true, require_valid_protocol: false });
    }
}
