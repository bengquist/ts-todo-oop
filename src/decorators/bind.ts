export default function bind(
  _: any,
  __: string,
  desciptor: PropertyDescriptor
) {
  const newMethod: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundMethod = desciptor.value.bind(this);
      return boundMethod;
    },
  };

  return newMethod;
}
