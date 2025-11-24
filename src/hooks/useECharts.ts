import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

export function useECharts(containerRef: React.RefObject<HTMLDivElement>) {
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Dispose existing instance if any
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose()
      chartInstanceRef.current = null
    }

    // Initialize fresh instance with proper dimensions
    const container = containerRef.current
    chartInstanceRef.current = echarts.init(container, null, { 
      renderer: 'canvas',
      useDirtyRect: true
    })

    // Ensure container is visible and has dimensions
    const resizeChart = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize()
      }
    }

    // Resize on window resize
    const handleResize = () => resizeChart()
    window.addEventListener('resize', handleResize)

    // Handle visibility changes (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(() => resizeChart(), 50)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Use ResizeObserver to detect container size changes
    resizeObserverRef.current = new ResizeObserver(() => {
      resizeChart()
    })
    resizeObserverRef.current.observe(container)

    // Initial resize to ensure proper rendering
    setTimeout(() => resizeChart(), 0)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
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
