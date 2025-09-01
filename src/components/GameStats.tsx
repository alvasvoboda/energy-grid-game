import React from 'react'
import { TrendingUp, TrendingDown, Zap, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface GameStatsProps {
  totalDemand: number
  totalSolar: number
  totalBatteryOutput: number
  totalGas: number
  isDeficit: boolean
  playerRevenue: number
  step: number
}

const GameStats: React.FC<GameStatsProps> = ({
  totalDemand,
  totalSolar,
  totalBatteryOutput,
  totalGas,
  isDeficit,
  playerRevenue,
  step
}) => {
  const totalSupply = totalSolar + totalBatteryOutput + totalGas
  const balance = totalSupply - totalDemand

  return (
    <div className="space-y-4">
      {/* System Status */}
      <Card className={`${isDeficit ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'} transition-colors`}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-lg flex items-center gap-2 ${isDeficit ? 'text-red-800' : 'text-green-800'}`}>
            {isDeficit ? <AlertTriangle className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isDeficit ? 'text-red-700' : 'text-green-700'}`}>
            {isDeficit ? 'SHORTAGE' : balance > 0 ? 'SURPLUS' : 'BALANCED'}
          </div>
          <div className={`text-sm ${isDeficit ? 'text-red-600' : 'text-green-600'}`}>
            {isDeficit ? 'High prices - good for selling!' : balance > 0 ? 'Low prices - good for charging!' : 'Supply matches demand'}
          </div>
        </CardContent>
      </Card>

      {/* Power Balance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Power Balance (Step {step})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Demand</span>
              <span className="font-mono font-semibold text-red-600">{totalDemand} MW</span>
            </div>
            
            <div className="h-px bg-gray-200"></div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Solar</span>
              <span className="font-mono text-yellow-600">{totalSolar} MW</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Batteries</span>
              <span className="font-mono text-purple-600">{totalBatteryOutput} MW</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Gas Plants</span>
              <span className="font-mono text-red-600">{totalGas} MW</span>
            </div>
            
            <div className="h-px bg-gray-200"></div>
            
            <div className="flex justify-between items-center font-semibold">
              <span>Balance</span>
              <span className={`font-mono flex items-center gap-1 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {balance >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {balance >= 0 ? '+' : ''}{balance} MW
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Performance */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-green-800">Your Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700 mb-1">
            ${playerRevenue.toFixed(0)}
          </div>
          <div className="text-sm text-green-600">
            Total Revenue
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GameStats