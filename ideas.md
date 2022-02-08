# ideas

add a new sense to a human body in a non-intrusive manner (aka no neural implants or surgery required)

## general

- use an existing sense to send all data to the brain
- human senses:
  - sight
  - taste
  - touch
  - pressure (different from touch)
  - itch (different from touch)
  - thermoception (heat transfer)
  - sound
  - smell
  - proprioception (limb positions)
  - tension sensors (in muscles)
  - nociception (pain)
  - equilibrioception (body acceleration and directionnal changes)
  - stretch receptors (in lungs and digestive track)
  - chemoreceptors
  - thirst (let me get some water)
  - hunger
  - magnetoception (more present with birds)
  - time
- probably sight through sound
- use hilbert cuve
- probably black and white

## sight to hearing

### sight advantages

- extensible
- could be changed to: infrared, ultraviolet, 360° vision...
- could represent anything that can be viewed as a 2d image

### hearing advantages

- unfortunately used for something else (hearing)
- only 1-dimensionnal (use of hilbert curve)
- most precise sense after sight (can't use sight to add sight)
- two completely different channels could be sent through 2 ears

### conclusion

this idea failed, as the rate of information flow in sight is too high for hearing to make sense of it

## weather to touch

current weather or weather forecast to vibrations

### implementation

_note: the pattern below was modified in the actual implementation, and will be updated when testing shows that the theory actually works_

```
duration = mid_output * (1 + output_deviation * tanh((input - mid_input) / input_deviation))
```

where `mid_input` is the average input value (highest resolution) and `input_deviation` is the difference between the extremes of the input (lower resolution). any input outside the range is very low resolution.

by default: `mid_output = 1000ms` and `output_deviation = 3/4`

**pattern**: [1. pause] [2. vibration] [3. pause] [4. vibration]

1. precipitation: `mid_input = 50%`, `input_deviation = 40%`
2. temperature: `mid_input` = `0°C`, `input_deviation = -20°C`
3. humidity: `mid_input = 50%`, `input_deviation = 40%`
4. wind: `mid_input = 0m/s`, `input_deviation = 10m/s`, `mid_output = 1000ms * 1/4`, `output_deviation = 2`
