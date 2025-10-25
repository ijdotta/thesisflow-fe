import { ErrorPage } from './ErrorPage'

export function NotFoundPage() {
  return (
    <ErrorPage
      statusCode={404}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      details="It might have been deleted or you may have mistyped the URL."
      action={{ label: 'Back to Projects', href: '/projects' }}
    />
  )
}

export function ForbiddenPage() {
  return (
    <ErrorPage
      statusCode={403}
      title="Access Forbidden"
      description="You don't have permission to access this resource."
      details="Only administrators or authorized users can access this page. Contact your admin if you think this is a mistake."
      action={{ label: 'Go Back', href: '/projects' }}
    />
  )
}

export function UnauthorizedPage() {
  return (
    <ErrorPage
      statusCode={401}
      title="Unauthorized"
      description="You need to be logged in to access this page."
      details="Your session may have expired. Please log in again."
      action={{ label: 'Go to Login', href: '/login' }}
    />
  )
}

export function ServerErrorPage() {
  return (
    <ErrorPage
      statusCode={500}
      title="Server Error"
      description="Something went wrong on our end."
      details="Our team has been notified and is working to fix it. Please try again later."
      action={{ label: 'Retry', href: '/projects' }}
    />
  )
}

export function BadRequestPage() {
  return (
    <ErrorPage
      statusCode={400}
      title="Bad Request"
      description="The request could not be understood by the server."
      details="Please check your input and try again."
      action={{ label: 'Go Back', href: '/projects' }}
    />
  )
}
