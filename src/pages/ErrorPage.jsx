import { useRouteError, Link } from 'react-router'

export default function ErrorPage() {
  const error = useRouteError()

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p style={{ color: '#999' }}>
        <i>{error.statusText || error.message}</i>
      </p>
      <Link to="/">Go back home</Link>
    </div>
  )
}
