import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

export function useECharts(containerRef: React.RefObject<HTMLDivElement>) {
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Dispose existing instance if any
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose()
      chartInstanceRef.current = null
    }

    // Initialize fresh instance
    chartInstanceRef.current = echarts.init(containerRef.current, null, { renderer: 'canvas' })

    // Resize on window resize
    const handleResize = () => {
      chartInstanceRef.current?.resize()
    }

    window.addEventListener('resize', handleResize)

    // Handle visibility changes (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden && chartInstanceRef.current) {
        setTimeout(() => chartInstanceRef.current?.resize(), 100)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose()
        chartInstanceRef.current = null
      }
    }
  }, [containerRef])

  const setOption = (option: echarts.EChartsOption) => {
    if (!chartInstanceRef.current) return
    chartInstanceRef.current.setOption(option, true)
  }

  const getInstance = () => chartInstanceRef.current

  return { setOption, getInstance }
}
