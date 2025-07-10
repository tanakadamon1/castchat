// Square Web Payments SDK types
declare global {
  interface Window {
    Square: {
      payments: (applicationId: string, locationId?: string) => {
        card: () => Promise<{
          attach: (element: string) => Promise<void>
          tokenize: () => Promise<{
            status: 'OK' | 'ERROR'
            token?: string
            errors?: Array<{ message: string }>
          }>
          destroy: () => void
        }>
      }
    }
  }
}

export {}