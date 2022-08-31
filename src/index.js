import React from 'react'
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App'
import { Provider } from 'react-redux';
import store from './store'

import { worker } from './api/server'

// import { extendedApiSlice } from './features/users/usersSlice'

if (process.env.NODE_ENV === 'development') {

  console.log('from worker start')
  worker.start()

}

// Wrap app rendering so we can wait for the mock API to initialize
// async function start() {
//   // Start our mock API server
//   await worker.start({ onUnhandledRequest: 'bypass' })

//   store.dispatch(extendedApiSlice.endpoints.getUsers.initiate())


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
// }
// start()
