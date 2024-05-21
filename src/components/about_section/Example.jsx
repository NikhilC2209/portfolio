import { TypeAnimation } from 'react-type-animation';

export default function Example({text, size, speed}) {

  return (
    <TypeAnimation
      sequence={text}
      wrapper="span"
      speed={speed ? speed : 60}
      // style={{ fontSize: '1.7em', display: 'inline-block', 'color': '#0FFF50' }}
      style={{ display: 'inline-block', 'color': '#0FFF50' }}
      className={size}
      repeat={Infinity}
    />
  );
}
