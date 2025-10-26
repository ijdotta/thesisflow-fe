import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

export function useECharts(containerRef: React.RefObject<HTMLDivElement>) {
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize or get existing instance
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(containerRef.current)
    }

    // Resize on window resize
    const handleResize = () => {
      chartInstanceRef.current?.resize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [containerRef])

  const setOption = (option: echarts.EChartsOption) => {
    chartInstanceRef.current?.setOption(option)
  }

  const getInstance = () => chartInstanceRef.current

  return { setOption, getInstance }
}
