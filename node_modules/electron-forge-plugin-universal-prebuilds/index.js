const fs = require('fs/promises')
const path = require('path')
const { default: PluginBase } = require('@electron-forge/plugin-base')

module.exports = class UniversalPrebuilds extends PluginBase {
  getHooks() {
    return {
      packageAfterCopy: [this.packageAfterCopy]
    }
  }

  async packageAfterCopy(config, buildPath, electronVersion, platform, arch) {
    await universalPrebuilds(buildPath, platform, arch)
  }
}

async function universalPrebuilds(base, platform, arch) {
  if (platform !== 'darwin') return

  const prebuilds = path.join(base, 'prebuilds')

  try {
    await fs.rename(
      path.join(prebuilds, platform + '-' + arch),
      path.join(prebuilds, platform + '-universal')
    )
  } catch (err) {
    if (err.code === 'ENOTEMPTY') {
      await fs.rm(path.join(prebuilds, platform + '-' + arch), { recursive: true })
    } else if (err.code !== 'ENOENT') {
      throw err
    }
  }

  const promises = []

  for await (const entry of opendir(path.join(base, 'node_modules'))) {
    if (entry.isDirectory()) {
      promises.push(universalPrebuilds(path.join(entry.parentPath, entry.name), platform, arch))
    }
  }

  await Promise.all(promises)
}

async function* opendir(base) {
  let dir
  try {
    dir = await fs.opendir(base, { withFileTypes: true })
  } catch {
    return
  }

  yield* dir
}
