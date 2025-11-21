import React from 'react';
import { Trophy, Award, Crown, Gem, Star, Zap, Shield, Flame } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TrophyLevel {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
  requirement: string;
}

const trophyLevels: TrophyLevel[] = [
  {
    name: 'Bronze',
    icon: Trophy,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    description: 'Primeiro passo',
    requirement: '10 apostas'
  },
  {
    name: 'Prata',
    icon: Award,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    description: 'Apostador consistente',
    requirement: '50 apostas'
  },
  {
    name: 'Ouro',
    icon: Trophy,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    description: 'Expertise em apostas',
    requirement: '100 apostas'
  },
  {
    name: 'Platina',
    icon: Crown,
    color: 'text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    description: 'Apostador elite',
    requirement: 'ROI positivo 30 dias'
  },
  {
    name: 'Esmeralda',
    icon: Gem,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    description: 'Mestre das surebets',
    requirement: 'Lucro R$ 10.000'
  },
  {
    name: 'Diamante',
    icon: Star,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    description: 'Profissional',
    requirement: 'ROI acima de 15%'
  },
  {
    name: 'Elite',
    icon: Zap,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    description: 'Entre os melhores',
    requirement: 'Top 10 ranking'
  },
  {
    name: 'Lendário',
    icon: Flame,
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    description: 'Lenda das surebets',
    requirement: 'Lucro R$ 100.000'
  }
];

export const Awards: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100">
          Sistema de Prêmios
        </h1>
        <div className="flex items-center gap-2 px-2 lg:px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
          <Shield className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-xs lg:text-sm font-medium text-yellow-700 dark:text-yellow-300">
            Em Desenvolvimento
          </span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-md bg-white/10 dark:bg-black/10 z-10 rounded-lg flex items-center justify-center">
          <div className="text-center p-4 lg:p-8">
            <Shield className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 dark:text-gray-500 mx-auto mb-3 lg:mb-4" />
            <h2 className="text-lg lg:text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
              Sistema em Desenvolvimento
            </h2>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-500">
              O sistema de prêmios estará disponível em breve
            </p>
          </div>
        </div>

        {/* Trophy Grid - Blurred Content */}
        <div className="h-full overflow-hidden p-2 lg:p-6">
          {/* Trophy Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6 mb-4 lg:mb-8">
            {trophyLevels.map((trophy, index) => {
              const IconComponent = trophy.icon;
              
              return (
                <div
                  key={trophy.name}
                  className={`relative p-3 lg:p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg ${
                    isDark ? 'bg-dark-800' : 'bg-white'
                  } border border-gray-200 dark:border-dark-600`}
                >
                  {/* Trophy Number */}
                  <div className="absolute top-1 right-1 lg:top-2 lg:right-2 w-4 h-4 lg:w-6 lg:h-6 bg-gray-200 dark:bg-dark-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                      {index + 1}
                    </span>
                  </div>

                  {/* Trophy Icon */}
                  <div className={`w-8 h-8 lg:w-16 lg:h-16 ${trophy.bgColor} rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-4`}>
                    <IconComponent className={`w-4 h-4 lg:w-8 lg:h-8 ${trophy.color}`} />
                  </div>

                  {/* Trophy Info */}
                  <div className="text-center">
                    <h3 className="text-sm lg:text-lg font-bold text-gray-800 dark:text-white mb-1 lg:mb-2">
                      {trophy.name}
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 mb-2 lg:mb-3">
                      {trophy.description}
                    </p>
                    <div className="bg-gray-100 dark:bg-dark-700 rounded-lg p-2 lg:p-3">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Requisito:
                      </p>
                      <p className="text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {trophy.requirement}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar (placeholder) */}
                  <div className="mt-2 lg:mt-4">
                    <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1 lg:h-2">
                      <div 
                        className={`h-1 lg:h-2 rounded-full ${trophy.color.replace('text-', 'bg-')}`}
                        style={{ width: `${Math.random() * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                      {Math.floor(Math.random() * 100)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-2 lg:gap-6">
            <div className={`p-3 lg:p-6 rounded-lg shadow-md ${isDark ? 'bg-dark-800' : 'bg-white'}`}>
              <div className="flex flex-col items-center gap-2 lg:gap-3">
                <Trophy className="w-4 h-4 lg:w-8 lg:h-8 text-yellow-500" />
                <div className="text-center">
                  <h3 className="text-xs lg:text-lg font-semibold text-gray-800 dark:text-white">
                    Troféus
                  </h3>
                  <p className="text-lg lg:text-3xl font-bold text-gray-800 dark:text-white">3</p>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">de 8</p>
                </div>
              </div>
            </div>

            <div className={`p-3 lg:p-6 rounded-lg shadow-md ${isDark ? 'bg-dark-800' : 'bg-white'}`}>
              <div className="flex flex-col items-center gap-2 lg:gap-3">
                <Star className="w-4 h-4 lg:w-8 lg:h-8 text-purple-500" />
                <div className="text-center">
                  <h3 className="text-xs lg:text-lg font-semibold text-gray-800 dark:text-white">
                    XP
                  </h3>
                  <p className="text-lg lg:text-3xl font-bold text-gray-800 dark:text-white">2,450</p>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">pontos</p>
                </div>
              </div>
            </div>

            <div className={`p-3 lg:p-6 rounded-lg shadow-md ${isDark ? 'bg-dark-800' : 'bg-white'}`}>
              <div className="flex flex-col items-center gap-2 lg:gap-3">
                <Crown className="w-4 h-4 lg:w-8 lg:h-8 text-blue-500" />
                <div className="text-center">
                  <h3 className="text-xs lg:text-lg font-semibold text-gray-800 dark:text-white">
                    Ranking
                  </h3>
                  <p className="text-lg lg:text-3xl font-bold text-gray-800 dark:text-white">#47</p>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">posição</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};