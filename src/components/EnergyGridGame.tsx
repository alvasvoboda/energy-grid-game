import React, { useState, useCallback, useEffect } from 'react'
import { Battery, Sun, Flame, Users, Zap, Play, RotateCcw, Plus, HelpCircle, Home } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import WelcomeScreen from './WelcomeScreen'
import HelpOverlay from './HelpOverlay'
import GameStats from './GameStats'

interface GridEntity {
  id: string
  x: number
  y: number
  type: 'customer' | 'solar' | 'gas' | 'battery' | 'playerBattery'
}

interface Customer extends GridEntity {
  type: 'customer'
  demand: number
}

interface SolarFarm extends GridEntity {
  type: 'solar'
  output: number
  capacity: number
}

interface GasPlant extends GridEntity {
  type: 'gas'
  output: number
  capacity: number
}

interface Battery extends GridEntity {
  type: 'battery'
  capacity: number
  currentStorage: number
  maxStorage: number
  output: number
  efficiency: number
}

interface PlayerBattery extends GridEntity {
  type: 'playerBattery'
  capacity: number
  currentStorage: number
  maxStorage: number
  output: number
  efficiency: number
}

const EnergyGridGame: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [solarFarms, setSolarFarms] = useState<SolarFarm[]>([])
  const [gasPlants, setGasPlants] = useState<GasPlant[]>([])
  const [batteries, setBatteries] = useState<Battery[]>([])
  const [playerBattery, setPlayerBattery] = useState<PlayerBattery | null>(null)
  const [isDeficit, setIsDeficit] = useState(false)
  const [playerRevenue, setPlayerRevenue] = useState(0)
  const [placingBattery, setPlacingBattery] = useState(false)
  const [step, setStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const generateRandomPosition = useCallback((existingEntities: GridEntity[]) => {
    let x = 0, y = 0
    let attempts = 0
    do {
      x = Math.floor(Math.random() * 10)
      y = Math.floor(Math.random() * 10)
      attempts++
    } while (
      existingEntities.some(entity => entity.x === x && entity.y === y) &&
      attempts < 100
    )
    return { x, y }
  }, [])

  const initializeGame = useCallback(() => {
    const allEntities: GridEntity[] = []

    // Generate customers
    const newCustomers: Customer[] = []
    for (let i = 0; i < 5; i++) {
      const pos = generateRandomPosition(allEntities)
      const customer: Customer = {
        id: `customer-${i}`,
        type: 'customer',
        x: pos.x,
        y: pos.y,
        demand: Math.floor(Math.random() * 10) + 1
      }
      newCustomers.push(customer)
      allEntities.push(customer)
    }

    // Generate solar farms
    const newSolarFarms: SolarFarm[] = []
    const solarCount = Math.floor(Math.random() * 5) + 3
    for (let i = 0; i < solarCount; i++) {
      const pos = generateRandomPosition(allEntities)
      const capacity = Math.floor(Math.random() * 5) + 1
      const solarFarm: SolarFarm = {
        id: `solar-${i}`,
        type: 'solar',
        x: pos.x,
        y: pos.y,
        capacity,
        output: Math.floor(Math.random() * capacity)
      }
      newSolarFarms.push(solarFarm)
      allEntities.push(solarFarm)
    }

    // Generate gas plants
    const newGasPlants: GasPlant[] = []
    const gasCount = Math.floor(Math.random() * 3) + 3
    for (let i = 0; i < gasCount; i++) {
      const pos = generateRandomPosition(allEntities)
      const capacity = Math.floor(Math.random() * 5) + 1
      const gasPlant: GasPlant = {
        id: `gas-${i}`,
        type: 'gas',
        x: pos.x,
        y: pos.y,
        capacity,
        output: 0
      }
      newGasPlants.push(gasPlant)
      allEntities.push(gasPlant)
    }

    // Generate NPC batteries
    const newBatteries: Battery[] = []
    const batteryCount = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < batteryCount; i++) {
      const pos = generateRandomPosition(allEntities)
      const capacity = Math.floor(Math.random() * 4) + 1
      const battery: Battery = {
        id: `battery-${i}`,
        type: 'battery',
        x: pos.x,
        y: pos.y,
        capacity,
        maxStorage: capacity * 4,
        currentStorage: Math.floor(Math.random() * capacity * 2),
        output: 0,
        efficiency: 0.9
      }
      newBatteries.push(battery)
      allEntities.push(battery)
    }

    setCustomers(newCustomers)
    setSolarFarms(newSolarFarms)
    setGasPlants(newGasPlants)
    setBatteries(newBatteries)
    setPlayerBattery(null)
    setIsDeficit(false)
    setPlayerRevenue(0)
    setStep(0)
    setIsRunning(false)
  }, [generateRandomPosition])

  const updateSystemState = useCallback(() => {
    const totalDemand = customers.reduce((sum, customer) => sum + customer.demand, 0)
    const totalSolar = solarFarms.reduce((sum, farm) => sum + farm.output, 0)
    
    let remainingDeficit = totalDemand - totalSolar
    let newPlayerRevenue = playerRevenue

    // Reset all outputs
    setBatteries(prev => prev.map(battery => ({ ...battery, output: 0 })))
    setGasPlants(prev => prev.map(plant => ({ ...plant, output: 0 })))

    if (remainingDeficit > 0) {
      // Deficit - discharge batteries first
      setBatteries(prev => prev.map(battery => {
        if (remainingDeficit > 0 && battery.currentStorage > 0) {
          const discharge = Math.min(battery.capacity, battery.currentStorage, remainingDeficit)
          remainingDeficit -= discharge
          return {
            ...battery,
            output: discharge,
            currentStorage: battery.currentStorage - discharge
          }
        }
        return battery
      }))

      // Player battery discharge
      if (playerBattery && remainingDeficit > 0 && playerBattery.currentStorage > 0) {
        const discharge = Math.min(playerBattery.capacity, playerBattery.currentStorage, remainingDeficit)
        remainingDeficit -= discharge
        newPlayerRevenue += discharge * 100 // $100/MWh
        setPlayerBattery(prev => prev ? {
          ...prev,
          output: discharge,
          currentStorage: prev.currentStorage - discharge
        } : null)
      }

      // Then dispatch gas plants
      if (remainingDeficit > 0) {
        setGasPlants(prev => prev.map(plant => {
          if (remainingDeficit > 0) {
            const output = Math.min(plant.capacity, remainingDeficit)
            remainingDeficit -= output
            return { ...plant, output }
          }
          return plant
        }))
      }

      setIsDeficit(remainingDeficit > 0)
    } else {
      // Surplus - charge batteries
      const surplus = Math.abs(remainingDeficit)
      let remainingSurplus = surplus

      setBatteries(prev => prev.map(battery => {
        if (remainingSurplus > 0 && battery.currentStorage < battery.maxStorage) {
          const maxCharge = Math.min(battery.capacity, battery.maxStorage - battery.currentStorage, remainingSurplus)
          const actualCharge = maxCharge * battery.efficiency
          remainingSurplus -= maxCharge
          return {
            ...battery,
            currentStorage: battery.currentStorage + actualCharge,
            output: -maxCharge // Negative indicates charging
          }
        }
        return battery
      }))

      // Player battery charging
      if (playerBattery && remainingSurplus > 0 && playerBattery.currentStorage < playerBattery.maxStorage) {
        const maxCharge = Math.min(playerBattery.capacity, playerBattery.maxStorage - playerBattery.currentStorage, remainingSurplus)
        const actualCharge = maxCharge * playerBattery.efficiency
        newPlayerRevenue -= maxCharge * 20 // Pay $20/MWh for charging
        setPlayerBattery(prev => prev ? {
          ...prev,
          currentStorage: prev.currentStorage + actualCharge,
          output: -maxCharge
        } : null)
      }

      setIsDeficit(false)
    }

    setPlayerRevenue(newPlayerRevenue)
  }, [customers, solarFarms, batteries, playerBattery, playerRevenue])

  const handleStep = useCallback(() => {
    // Update demands and solar output
    setCustomers(prev => prev.map(customer => ({
      ...customer,
      demand: Math.floor(Math.random() * 10) + 1
    })))

    setSolarFarms(prev => prev.map(farm => ({
      ...farm,
      output: Math.floor(Math.random() * farm.capacity)
    })))

    setStep(prev => prev + 1)
    
    // Update system state after state changes
    setTimeout(updateSystemState, 0)
  }, [updateSystemState])

  const handleReset = useCallback(() => {
    initializeGame()
  }, [initializeGame])

  const handleAddPlayerBattery = useCallback(() => {
    if (!playerBattery) {
      setPlacingBattery(true)
    }
  }, [playerBattery])

  const handleGridClick = useCallback((x: number, y: number) => {
    if (placingBattery) {
      const allEntities: GridEntity[] = [...customers, ...solarFarms, ...gasPlants, ...batteries]
      
      const occupied = allEntities.some(entity => entity.x === x && entity.y === y)
      
      if (!occupied) {
        const capacity = Math.floor(Math.random() * 4) + 1
        const newPlayerBattery: PlayerBattery = {
          id: 'player-battery',
          type: 'playerBattery',
          x,
          y,
          capacity,
          maxStorage: capacity * 4,
          currentStorage: 0,
          output: 0,
          efficiency: 0.9
        }
        setPlayerBattery(newPlayerBattery)
        setPlacingBattery(false)
      }
    }
  }, [placingBattery, customers, solarFarms, gasPlants, batteries, playerBattery])

  const handleStartGame = useCallback(() => {
    setGameStarted(true)
    initializeGame()
  }, [initializeGame])

  const handleBackToWelcome = useCallback(() => {
    setGameStarted(false)
    setShowHelp(false)
    initializeGame()
  }, [initializeGame])

  // Auto-run simulation
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(handleStep, 2000)
      return () => clearInterval(interval)
    }
  }, [isRunning, handleStep])

  const renderEntity = (entity: GridEntity) => {
    const baseProps = {
      key: entity.id,
      cx: entity.x * 50 + 25,
      cy: entity.y * 50 + 25,
    }

    switch (entity.type) {
      case 'customer':
        const customer = entity as Customer
        return (
          <TooltipProvider key={entity.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  <circle
                    {...baseProps}
                    r="12"
                    fill={isDeficit ? "#ef4444" : "#3b82f6"}
                    className={`${isDeficit ? "animate-pulse" : ""} transition-colors duration-300`}
                  />
                  <Users
                    x={entity.x * 50 + 17}
                    y={entity.y * 50 + 17}
                    size={16}
                    color="white"
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">Customer</p>
                <p>{customer.demand} MW demand</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      
      case 'solar':
        const solar = entity as SolarFarm
        return (
          <TooltipProvider key={entity.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  <circle {...baseProps} r="14" fill="#fbbf24" className="transition-all duration-300" />
                  <Sun
                    x={entity.x * 50 + 17}
                    y={entity.y * 50 + 17}
                    size={16}
                    color="white"
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">Solar Farm</p>
                <p>{solar.output}/{solar.capacity} MW</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      
      case 'gas':
        const gas = entity as GasPlant
        return (
          <TooltipProvider key={entity.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  <circle 
                    {...baseProps} 
                    r="14" 
                    fill="#ef4444" 
                    className={`${gas.output > 0 ? 'animate-pulse' : ''} transition-all duration-300`}
                  />
                  <Flame
                    x={entity.x * 50 + 17}
                    y={entity.y * 50 + 17}
                    size={16}
                    color="white"
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">Gas Plant</p>
                <p>{gas.output}/{gas.capacity} MW</p>
                <p className="text-xs text-gray-500">Expensive backup power</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      
      case 'battery':
        const battery = entity as Battery
        const batteryFillPercent = (battery.currentStorage / battery.maxStorage) * 100
        return (
          <TooltipProvider key={entity.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  <circle {...baseProps} r="14" fill="#8b5cf6" className="transition-all duration-300" />
                  <Battery
                    x={entity.x * 50 + 17}
                    y={entity.y * 50 + 17}
                    size={16}
                    color="white"
                  />
                  {/* Battery level indicator */}
                  <rect
                    x={entity.x * 50 + 15}
                    y={entity.y * 50 + 35}
                    width="20"
                    height="4"
                    fill="rgba(139, 92, 246, 0.3)"
                    rx="2"
                  />
                  <rect
                    x={entity.x * 50 + 15}
                    y={entity.y * 50 + 35}
                    width={20 * (batteryFillPercent / 100)}
                    height="4"
                    fill="#8b5cf6"
                    rx="2"
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">NPC Battery</p>
                <p>{battery.currentStorage.toFixed(1)}/{battery.maxStorage} MWh stored</p>
                <p>{battery.output > 0 ? `Discharging: ${battery.output.toFixed(1)} MW` : 
                     battery.output < 0 ? `Charging: ${Math.abs(battery.output).toFixed(1)} MW` : 'Idle'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      
      case 'playerBattery':
        const playerBat = entity as PlayerBattery
        const playerFillPercent = (playerBat.currentStorage / playerBat.maxStorage) * 100
        return (
          <TooltipProvider key={entity.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  <circle {...baseProps} r="16" fill="#10b981" className="transition-all duration-300 shadow-lg" />
                  <Battery
                    x={entity.x * 50 + 17}
                    y={entity.y * 50 + 17}
                    size={16}
                    color="white"
                  />
                  {/* Battery level indicator */}
                  <rect
                    x={entity.x * 50 + 13}
                    y={entity.y * 50 + 37}
                    width="24"
                    height="6"
                    fill="rgba(16, 185, 129, 0.3)"
                    rx="3"
                  />
                  <rect
                    x={entity.x * 50 + 13}
                    y={entity.y * 50 + 37}
                    width={24 * (playerFillPercent / 100)}
                    height="6"
                    fill="#10b981"
                    rx="3"
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium text-green-700">Your Battery</p>
                <p>{playerBat.currentStorage.toFixed(1)}/{playerBat.maxStorage} MWh stored</p>
                <p>Capacity: {playerBat.capacity} MW</p>
                <p>{playerBat.output > 0 ? `💰 Earning: ${playerBat.output.toFixed(1)} MW × $100` : 
                     playerBat.output < 0 ? `💸 Paying: ${Math.abs(playerBat.output).toFixed(1)} MW × $20` : 'Idle'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      
      default:
        return null
    }
  }

  if (!gameStarted) {
    return (
      <>
        <WelcomeScreen onStart={handleStartGame} onShowHelp={() => setShowHelp(true)} />
        <HelpOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />
      </>
    )
  }

  const totalDemand = customers.reduce((sum, customer) => sum + customer.demand, 0)
  const totalSolar = solarFarms.reduce((sum, farm) => sum + farm.output, 0)
  const totalGas = gasPlants.reduce((sum, plant) => sum + plant.output, 0)
  const totalBatteryOutput = batteries.reduce((sum, battery) => sum + Math.max(0, battery.output), 0)
  const playerBatteryOutput = playerBattery ? Math.max(0, playerBattery.output) : 0

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Energy Grid Trading</h1>
                <p className="text-sm text-gray-600">Step {step} • {isRunning ? 'Auto-running' : 'Manual mode'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBackToWelcome}>
                <Home className="w-4 h-4 mr-2" />
                Menu
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Game Grid */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Electricity Grid</h2>
                  {placingBattery && (
                    <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      Click empty spot to place battery
                    </div>
                  )}
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 shadow-inner">
                  <svg
                    width="500"
                    height="500"
                    className="border-2 border-white bg-white rounded-lg shadow-sm"
                    onClick={(e) => {
                      if (placingBattery) {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = Math.floor((e.clientX - rect.left) / 50)
                        const y = Math.floor((e.clientY - rect.top) / 50)
                        handleGridClick(x, y)
                      }
                    }}
                    style={{ cursor: placingBattery ? 'crosshair' : 'default' }}
                  >
                    {/* Grid lines */}
                    {Array.from({ length: 11 }, (_, i) => (
                      <g key={`grid-${i}`}>
                        <line
                          x1={i * 50}
                          y1={0}
                          x2={i * 50}
                          y2={500}
                          stroke="#f3f4f6"
                          strokeWidth={1}
                        />
                        <line
                          x1={0}
                          y1={i * 50}
                          x2={500}
                          y2={i * 50}
                          stroke="#f3f4f6"
                          strokeWidth={1}
                        />
                      </g>
                    ))}
                    
                    {/* Render all entities */}
                    {customers.map(renderEntity)}
                    {solarFarms.map(renderEntity)}
                    {gasPlants.map(renderEntity)}
                    {batteries.map(renderEntity)}
                    {playerBattery && renderEntity(playerBattery)}
                  </svg>
                </div>

                {/* Controls */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button 
                    onClick={handleStep} 
                    disabled={isRunning}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Next Step
                  </Button>
                  
                  <Button 
                    onClick={() => setIsRunning(!isRunning)}
                    variant={isRunning ? "destructive" : "outline"}
                  >
                    {isRunning ? 'Stop Auto' : 'Auto Run'}
                  </Button>
                  
                  <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Game
                  </Button>
                  
                  {!playerBattery && (
                    <Button 
                      onClick={handleAddPlayerBattery} 
                      variant="outline"
                      disabled={placingBattery}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {placingBattery ? 'Click to Place' : 'Add Your Battery'}
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Stats Panel */}
            <div className="lg:col-span-1">
              <GameStats
                totalDemand={totalDemand}
                totalSolar={totalSolar}
                totalBatteryOutput={totalBatteryOutput + playerBatteryOutput}
                totalGas={totalGas}
                isDeficit={isDeficit}
                playerRevenue={playerRevenue}
                step={step}
              />

              {playerBattery && (
                <Card className="mt-4 border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                      <Battery className="w-5 h-5" />
                      Your Battery
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Storage</span>
                      <span className="font-mono text-green-800">
                        {playerBattery.currentStorage.toFixed(1)}/{playerBattery.maxStorage} MWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Capacity</span>
                      <span className="font-mono text-green-800">{playerBattery.capacity} MW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Status</span>
                      <span className="font-mono text-green-800">
                        {playerBattery.output > 0 ? `Selling ${playerBattery.output.toFixed(1)} MW` : 
                         playerBattery.output < 0 ? `Buying ${Math.abs(playerBattery.output).toFixed(1)} MW` : 'Idle'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <HelpOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  )
}

export default EnergyGridGame