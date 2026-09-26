import { Outlet } from 'react-router-dom'
import { useSharedModel } from '../../contexts/ModelContext'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
export function AppLayout() { const { status } = useSharedModel(); return <div className="flex min-h-screen bg-[#f4f7f2]"><Sidebar status={status}/><div className="min-w-0 flex-1"><MobileNav status={status}/><main className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10"><Outlet/></main></div></div> }
