/**
 * Rasterizes an inline SVG chart to a PNG and downloads it. Works entirely
 * client-side: serialize the SVG, draw it into a canvas at 2x for sharpness,
 * then export. CSS custom properties (--series-1 etc.) are resolved to their
 * computed values first since a canvas image has no stylesheet to read them.
 */
export function downloadChartPng(svg: SVGSVGElement, filename = 'chart.png') {
  const clone = svg.cloneNode(true) as SVGSVGElement
  const computed = getComputedStyle(svg)

  // Bake the resolved --series-*/--grid/--axis colors into the clone so the
  // rasterized image matches what's on screen, light or dark.
  const roles = ['--series-1', '--series-2', '--surface-1', '--grid', '--axis', '--ink-muted']
  const resolved = Object.fromEntries(roles.map((role) => [role, computed.getPropertyValue(role).trim()]))
  clone.querySelectorAll('*').forEach((el) => {
    for (const attr of ['fill', 'stroke']) {
      const value = el.getAttribute(attr)
      if (value && value.startsWith('var(')) {
        const role = value.slice(4, -1).trim()
        if (resolved[role]) el.setAttribute(attr, resolved[role])
      }
    }
  })

  const bg = resolved['--surface-1'] || '#ffffff'
  clone.setAttribute('style', `background:${bg}`)

  const width = svg.viewBox.baseVal.width || svg.clientWidth
  const height = svg.viewBox.baseVal.height || svg.clientHeight
  const scale = 2

  const svgData = new XMLSerializer().serializeToString(clone)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const image = new Image()
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      URL.revokeObjectURL(url)
      return
    }
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.scale(scale, scale)
    ctx.drawImage(image, 0, 0, width, height)
    URL.revokeObjectURL(url)

    canvas.toBlob((blob) => {
      if (!blob) return
      const pngUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = pngUrl
      link.download = filename
      link.click()
      URL.revokeObjectURL(pngUrl)
    }, 'image/png')
  }
  image.onerror = () => URL.revokeObjectURL(url)
  image.src = url
}
