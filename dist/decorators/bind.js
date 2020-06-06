export default function bind(_, __, desciptor) {
    const newMethod = {
        configurable: true,
        get() {
            const boundMethod = desciptor.value.bind(this);
            return boundMethod;
        },
    };
    return newMethod;
}
