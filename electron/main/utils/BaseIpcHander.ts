import { ipcMain } from 'electron'

export class BaseIpcHander {
  constructor() {
    this.registerIpcHandles()
  }
  registerIpcHandles() {
    const handles = (this.constructor as any)._ipcHandles || []
    console.log('handles:', handles)
    handles.forEach((handle: any) => {
      ipcMain.handle(handle.eventName, (event, data) => {
        return handle.method.call(this, data)
      })
    })
  }
}
