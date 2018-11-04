import React from 'react';
import cx from 'classnames';
import { Stack } from '@vx/shape';
import { Group } from '@vx/group';
import { curveBasis } from '@vx/curve';
import {Spring} from 'react-spring';
import { PatternCircles, PatternWaves } from '@vx/pattern';
import { scaleTime, scaleLinear, scaleOrdinal } from '@vx/scale';
import { cityTemperature } from '@vx/mock-data';
import { timeParse } from 'd3-time-format';
import { transpose } from 'd3-array';
import {withScreenSize} from '@vx/responsive'

// utils
const max = (data, accessor) => Math.max(...data.map(accessor));
const min = (data, accessor) => Math.min(...data.map(accessor));
const extent = (data, accessor) => [
  min(data, accessor),
  max(data, accessor),
];
const range = n => Array.from(Array(n), (d, i) => i);

const numLayers = 20;
const samplesPerLayer = 200;
const bumpsPerLayer = 10;

const keys = range(numLayers);

function bumps(n, m) {
  var a = [],
    i;
  for (i = 0; i < n; ++i) a[i] = 0;
  for (i = 0; i < m; ++i) bump(a, n);
  return a;
}


function bump(a, n) {
  var x = 1 / (0.1 + Math.random()),
    y = 2 * Math.random() - 0.5,
    z = 10 / (0.1 + Math.random());
  for (var i = 0; i < n; i++) {
    var w = (i / n - y) * z;
    a[i] += x * Math.exp(-w * w);
  }
}

const warm = {
  happy: ['#6E44FF', '#B892FF', '#FFC2E2', '#FF90B3', '#EF7A85', '#dbc472'],
  sad: ['#e29595', '#f99f4a', '#772720', '#fcf297', '#94a382', '#ad537e']
};
const cool = {
  happy: ['#AC80A0', '#89AAE6', '#3685B5', '#0471A6', '#061826', '#70A9A1'],
  sad: ['#D8CBBC', '#B9CCB9', '#9CBAA2', '#638D96', '#444C7F', '#595758']
};

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

function rgbToHsl(r, g, b){
  r /= 255;
  g /= 255;
  b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min){
      h = s = 0; // achromatic
  }else{
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
  }

  return [360*h, 100*s, 100*l];
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).slice(0,6);
}

function hslToRgb(h, s, l){
  h = h/360;
  s = s/100;
  l = l/100;
  var r, g, b;

  if(s == 0){
      r = g = b = l; // achromatic
  }else{
      function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }

  return [r * 255, g * 255, b * 255];
}

const epsilon = [20, 5, 10]
const s = {
  major: {
    happy: [40, 82, 50],
    sad: [331, 50, 50]
  },
  minor: {
    happy: [86, 60, 50],
    sad: [262, 46, 34]
  }
}

const generateNewColor = (h,s,l) => {
  h = (Math.random() > 0.5 ? (h + Math.random()*epsilon[0]) : (h - Math.random()*epsilon[0])) % 360;
  s = (Math.random() > 0.5 ? (s + Math.random()*epsilon[1]) : (s - Math.random()*epsilon[1])) % 100;
  l = (Math.random() > 0.5 ? (l + Math.random()*epsilon[2]) : (l - Math.random()*epsilon[2])) % 100;
  const rgb = hslToRgb(h,s,l);
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

const generateColors = (colors) => {
  let rv = ["","","","","",""]
  for (let i = 0; i < colors.length; i++) {
    const rgb = hexToRgb(colors[i]);
    let hsl = [];
    if (rgb == undefined) {
      hsl = s.major.happy
    } else {
      hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    }
    i == 1 && console.log(hsl);
    rv[i] = generateNewColor(hsl[0], hsl[1], hsl[2]);
  }
  console.log("generate", rv);
  return rv;
};

const initColors = (arr) => {
  const h = arr[0];
  const s = arr[1];
  const l = arr[2];
  const rgb = hslToRgb(h,s,l);
  const hex = rgbToHex(rgb[0],rgb[1],rgb[2]);
  const rv = [hex, hex, hex, hex, hex, hex];
  console.log("init", rv);
  return rv
}

class Streamgraph extends React.Component {
  constructor(props) {
    console.log("Constructing");
    super(props);
    this.state = {
      tempo : props.tempo,
      colors: generateColors(initColors(
        props.majorMinor ?
       (props.happy ? s.major.happy : s.major.sad)
       :
       (props.happy ? s.minor.happy : s.minor.sad)))
    };
    this.interval = setInterval(() => this.updateColors(),  6000000000000000000000)
  }

  updateColors = () => {
    let colors = generateColors(this.state.colors);
    this.setState({
      colors: colors
    }, () => this.forceUpdate());
    console.log(colors);
  };
  render() {
    const {
      width,
      height,
      majorMinor,
      happy,
      events = false,
      margin = {
        top: 40,
      },
    } = this.props;
    if (width < 10) return null;

    if (this.props.nextSong) {

      clearInterval(this.interval)
      let temp;
      if (this.props.tempo === null || this.props.tempo === undefined) {
        temp = this.props.tempo = 100;
      } else {
        temp = 60000 / this.props.tempo
      }
      this.interval = setInterval(() => this.updateColors(), temp);
      this.setState({
        colors: generateColors(initColors(
          this.props.majorMinor ?
         (this.props.happy ? s.major.happy : s.major.sad)
         :
         (this.props.happy ? s.minor.happy : s.minor.sad)))

      });
      this.props.setNextSong();

    }

    const layers = transpose(
      keys.map(d => bumps(samplesPerLayer, bumpsPerLayer)),
    );

    const xScale = scaleLinear({
      range: [0, width],
      domain: [0, samplesPerLayer - 1],
    });
    const yScale = scaleLinear({
      range: [height, 0],
      domain: [-30, 50],
    });

    //Fill colors for patterns
    const zScale = scaleOrdinal({
      domain: keys,
      range: this.state.colors,
    });
    const patternScale = scaleOrdinal({
      domain: keys,
      range: [
        'mustard',
        'cherry',
        'navy',
        'transparent',
        'transparent',
        'transparent',
        'transparent',
      ],
    });

    return (
      <svg width={width} height={height}>
        <PatternCircles
          id="mustard"
          height={40}
          width={40}
          radius={5}
          fill="#036ecf"
          complement
        />
        <PatternWaves
          id="cherry"
          height={12}
          width={12}
          fill="transparent"
          stroke="#232493"
          strokeWidth={1}
          complement
        />
        <PatternCircles
          id="navy"
          height={60}
          width={60}
          radius={10}
          fill="white"
          complement
        />
        <PatternCircles
          id="transparent"
          height={60}
          width={60}
          radius={10}
          fill="transparent"
          complement
        />
        <g
          onClick={event => this.updateColors()}
          onTouchStart={event => this.updateColors()}
        >
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#E8ECEF"
            rx={14}
          />
          <Stack
            data={layers}
            keys={keys}
            offset="wiggle"
            x={(d, i) => xScale(i)}
            y0={d => yScale(d[0])}
            y1={d => yScale(d[1])}
            render={({ seriesData, path }) => {
              return seriesData.map((series, i) => {
                const d = path(series)
                return (
                  <g key={`series-${series.key}`}>
                  <Spring to={{ d }} config={{velocity: 10}}>
                    {tweened => (
                      <React.Fragment>
                        <path d={tweened.d} fill={zScale(series.key)} />
                        <path d={tweened.d} fill={`url(#${patternScale(series.key)})`} />
                      </React.Fragment>
                    )}
                  </Spring>
                    />
                  </g>
                );
              });
            }}
          />
        </g>
      </svg>
    );
  }
} export default Streamgraph;
