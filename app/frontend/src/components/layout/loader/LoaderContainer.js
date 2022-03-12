import React from 'react';

const LoaderContainer = ({
  id,
  fullscreenClassName,
  fullscreenStyle,
  fullscreen = false,
  minWidth = '100px',
  minHeight = '100px',
  SpinnerDiv,
  showSpinner = true,
}) => {
  // Required style
  const fullscreenStyleAll = {
    position: 'fixed',
    width: '100vw',
    height: '100vh',
    top: 0,
    left: 0,
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
    visibility: 'visible',
    ...fullscreenStyle,
  };

  const coveringStyle = {
    visibility: 'visible',
    top: 0,
    minHeight,
    height: '100%',
    minWidth,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem auto',
  };

  const hiddenStyle = {
    visibility: 'hidden',
    position: 'relative',
  };

  return (
    <div id={id} style={showSpinner ? hiddenStyle : {}}>
      {showSpinner && (
        <div
          style={fullscreen ? fullscreenStyleAll : coveringStyle}
          className={fullscreen ? fullscreenClassName : null}>
          <SpinnerDiv />
        </div>
      )}
    </div>
  );
};

export default LoaderContainer;
