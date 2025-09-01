import React from 'react'
import { X, Zap, Battery, Sun, Flame, Users, DollarSign, TrendingUp } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface HelpOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const HelpOverlay: React.FC<HelpOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            How to Play
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Quick Start */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">🚀 Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <ol className="list-decimal list-inside space-y-2">
                <li>Click <strong>"Add Your Battery"</strong> to place your storage system</li>
                <li>Click an empty grid spot to place it</li>
                <li>Press <strong>"Next Step"</strong> to advance the simulation</li>
                <li>Watch your revenue grow as you participate in the electricity market!</li>
              </ol>
            </CardContent>
          </Card>

          {/* Game Entities */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Grid Entities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Customers</div>
                    <div className="text-sm text-gray-600">Electricity demand (1-10 MW)</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Sun className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Solar Farms</div>
                    <div className="text-sm text-gray-600">Clean energy (varies with weather)</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Gas Plants</div>
                    <div className="text-sm text-gray-600">Backup power (expensive)</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Battery className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">NPC Batteries</div>
                    <div className="text-sm text-gray-600">Your competition</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Battery className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Your Battery</div>
                    <div className="text-sm text-gray-600">Your revenue generator!</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  How You Make Money
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-medium text-green-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Earn $100/MWh
                  </div>
                  <div className="text-sm text-green-700">
                    When you discharge during shortages (demand &gt; solar)
                  </div>
                </div>
                
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="font-medium text-orange-800">
                    Pay $20/MWh
                  </div>
                  <div className="text-sm text-orange-700">
                    When you charge during surplus (solar &gt; demand)
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mt-3">
                  <strong>Strategy:</strong> Charge when electricity is cheap (sunny periods) and discharge when it's expensive (high demand periods).
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Mechanics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ Market Dispatch Order</CardTitle>
              <CardDescription>How the electricity market decides who generates power</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div>
                    <div className="font-medium">Solar First</div>
                    <div className="text-sm text-gray-600">Free fuel = lowest cost</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div>
                    <div className="font-medium">Batteries Second</div>
                    <div className="text-sm text-gray-600">Stored energy = medium cost</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div>
                    <div className="font-medium">Gas Plants Last</div>
                    <div className="text-sm text-gray-600">Fuel costs = highest cost</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">💡 Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-green-800 space-y-2">
              <div>• <strong>Watch the weather:</strong> Solar output varies randomly each step</div>
              <div>• <strong>Monitor demand:</strong> Customer needs change constantly</div>
              <div>• <strong>Time your moves:</strong> Charge during sunny periods, discharge during peak demand</div>
              <div>• <strong>Compete wisely:</strong> Other batteries are trying to make money too!</div>
              <div>• <strong>System status matters:</strong> Red = shortage (good for selling), Green = surplus (good for buying)</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default HelpOverlay