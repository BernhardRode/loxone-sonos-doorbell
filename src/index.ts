import fastify from 'fastify';
import fastifyStatic from 'fastify-static';
import path from 'path';
import { InternalServerError, NotFoundError } from 'restify-errors';
import { Sonos, AsyncDeviceDiscovery } from 'sonos';

const ring = async (ip, uri, volume = 30) => {
  const device = new Sonos(ip)
  // const currentVolume = await device.getVolume()
  // if (currentVolume !== volume) {
  //   console.log(`SetVolume(${await device.getVolume()})`)
  //   await device.setVolume(volume)
  // }
  // await device.play(uri)
  console.log(`Play Notification ${uri}`);
  const result = await device.playNotification({ uri, volume })
  console.log(result);

  // if (currentVolume !== volume) {
  //   console.log(`SetVolume back to (${currentVolume})`)
  //   await device.setVolume(currentVolume)
  // }
}

// Run the server!
const start = async () => {
  const fileName = 'slow-generic-door-bell.mp3'
  const soundsFolder = 'sounds'
  const assetsFolder = 'assets'
  const port = 3000

  const staticRootFolder = path.join(__dirname, '..', assetsFolder)
  const staticOptions: any = {
    root: staticRootFolder,
    list: {
      format: 'json'
    }
  }

  const server = fastify({ logger: true })
  server.register(fastifyStatic, staticOptions)
  // Declare a route
  server.get('/ring/:ip', async (request) => {
    try {
      const uri = `http://${request.headers.host}/${soundsFolder}/${fileName}`
      const { ip } = request.params as any
      await ring(ip, uri)
      return 'Ok'
    } catch (error) {
      server.log.error(error)
      return new InternalServerError()
    }
  })
  // Declare a route
  server.get('/devices', async () => {
    try {
      return new AsyncDeviceDiscovery().discover()
    } catch (error) {
      server.log.error(error)
      return new InternalServerError()
    }
  })

  try {
    await server.listen(port, '0.0.0.0')
    server.log.info(`server listening on ${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()