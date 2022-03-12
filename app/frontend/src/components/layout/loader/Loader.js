import React, { useEffect, useRef, useState } from 'react';

import LoaderContainer from './LoaderContainer';

const Loader = ({
  id,
  color,
  secondaryColor,
  tertiaryColor,
  speedMultiplier,
  loadingState,
  fullscreenClassName,
  fullscreenStyle,
  fullscreen,
  debounce,
  showInitially,
  height,
  width,
  radius,
}) => {
  // Loading options
  const [showSpinner, setShowSpinner] = useState(showInitially);
  const timer = useRef();

  useEffect(() => {
    if (loadingState) {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      if (loadingState.is_loading && !showSpinner) {
        setShowSpinner(true);
      } else if (!loadingState.is_loading && showSpinner) {
        timer.current = setTimeout(() => setShowSpinner(false), debounce);
      }
    }
  }, [loadingState, debounce, showSpinner]);

  const SpinnerDiv = () => {
    const maxRadius = radius + 2 * Math.ceil(radius / 3);
    const animationTime = 0.8 / speedMultiplier;

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="loading">
        <circle cx="25%" cy="50%" r={maxRadius} fill={color}>
          <animate
            attributeName="r"
            from={`${maxRadius}`}
            to={`${maxRadius}`}
            begin="0s"
            dur={`${animationTime}s`}
            values={`${maxRadius};${radius};${maxRadius}`}
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fillOpacity"
            from="1"
            to="1"
            begin="0s"
            dur={`${animationTime}s`}
            values="1;.25;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          attributeName="fillOpacity"
          from="1"
          to="0.3"
          fill={secondaryColor || color}>
          <animate
            attributeName="r"
            from={`${radius}`}
            to={`${radius}`}
            begin="0s"
            dur={`${animationTime}s`}
            values={`${radius};${maxRadius};${radius}`}
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fillOpacity"
            from="0.25"
            to="0.25"
            begin="0s"
            dur={`${animationTime}s`}
            values=".25;1;.25"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="75%" cy="50%" r={maxRadius} fill={tertiaryColor || color}>
          <animate
            attributeName="r"
            from={`${maxRadius}`}
            to={`${maxRadius}`}
            begin="0s"
            dur={`${animationTime}s`}
            values={`${maxRadius};${radius};${maxRadius}`}
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fillOpacity"
            from="1"
            to="1"
            begin="0s"
            dur={`${animationTime}s`}
            values="1;.25;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    );
  };

  return (
    <LoaderContainer
      id={id}
      fullscreen={fullscreen}
      fullscreenClassName={fullscreenClassName}
      fullscreenStyle={fullscreenStyle}
      minHeight={height}
      minWidth={width}
      SpinnerDiv={SpinnerDiv}
      showSpinner={showSpinner}
    />
  );
};

Loader.defaultProps = {
  debounce: 0,
  showInitially: true,
  speedMultiplier: 1,
  color: '#D6001C',
  secondaryColor: '#E87722',
  tertiaryColor: '#F2A900',
  width: 120,
  height: 36,
  radius: 8,
};

export default Loader;
