import { episode1 } from '../Episode/episode1.js'
import { episode2 } from '../Episode/episode2.js'
import { episode3 } from '../Episode/episode3.js'
import { episode4 } from '../Episode/episode4.js'
import { episode5 } from '../Episode/episode5.js'
import { episode6 } from '../Episode/episode6.js'
import { episode7 } from '../Episode/episode7.js'
import { episode8 } from '../Episode/episode8.js'
import { episode9 } from '../Episode/episode9.js'
import { episode10 } from '../Episode/episode10.js'
import { episode11 } from '../Episode/episode11.js'
import { episode12 } from '../Episode/episode12.js'
import { episode13 } from '../Episode/episode13.js'
import { episode14 } from '../Episode/episode14.js'
import { summary } from '../Episode/summary.js'

// Re-export summary for convenience
export { summary }

// All episodes array
export const allEpisodes = [
  episode1,
  episode2,
  episode3,
  episode4,
  episode5,
  episode6,
  episode7,
  episode8,
  episode9,
  episode10,
  episode11,
  episode12,
  episode13,
  episode14,
]

// Helper function to get episode by number
export const getEpisode = (episodeNumber) => {
  if (episodeNumber < 1 || episodeNumber > allEpisodes.length) {
    return null
  }
  return allEpisodes[episodeNumber - 1]
}

// Get total number of episodes
export const getTotalEpisodes = () => allEpisodes.length
