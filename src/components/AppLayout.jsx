import { Outlet } from 'react-router'
import AuthBar from './AuthBar'
import BottomNav from './BottomNav'
import OfflineIndicator from './OfflineIndicator'
import InstallPrompt from './InstallPrompt'

export default function AppLayout() {
  return (
    <>
      <AuthBar />
      <Outlet />
      <OfflineIndicator />
      <InstallPrompt />
      <BottomNav />
    </>
  )
}
