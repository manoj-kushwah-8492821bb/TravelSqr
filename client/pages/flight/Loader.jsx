import React from 'react'

function Loader() {
  return (
    <div style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
      <img src="/img/loader.gif" alt="Loading..." className="loader" style={{width:'-webkit-fill-available'}} />
    </div>
  )
}

export default Loader