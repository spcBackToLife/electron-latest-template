export function wrapResponse() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args)
        return {
          success: true,
          data: result,
          status: 200,
        }
      } catch (error) {
        console.error(`Error in ${propertyKey}:`, error)
        return {
          success: false,
          data: null,
          status: 500,
          message: error.message || 'An error occurred',
        }
      }
    }

    return descriptor
  }
}
