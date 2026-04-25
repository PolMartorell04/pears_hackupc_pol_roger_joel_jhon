const fs = require('fs/promises')
const path = require('path')
const { default: PluginBase } = require('@electron-forge/plugin-base')

module.exports = class PrunePrebuilds extends PluginBase {
  getHooks() {
    return {
      packageAfterPrune: [this.packageAfterPrune]
    }
  }

  async packageAfterPrune(config, buildPath, electronVersion, platform, arch) {
    await prunePrebuilds(buildPath, platform, arch)
  }
}

async function prunePrebuilds(base, platform, arch) {
  for await (const entry of opendir(path.join(base, 'prebuilds'))) {
    if (entry.name === platform + '-' + arch || entry.name.endsWith('-universal')) continue

    await fs.rm(path.join(entry.parentPath, entry.name), { recursive: true })
  }

  const promises = []

  for await (const entry of opendir(path.join(base, 'node_modules'))) {
    if (entry.isDirectory()) {
      promises.push(prunePrebuilds(path.join(entry.parentPath, entry.name), platform, arch))
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
