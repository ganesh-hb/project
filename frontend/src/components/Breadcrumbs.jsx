// 'use client'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'

// export default function Breadcrumbs() {
//     const pathname = usePathname()
//     const pathSegments = pathname.split('/').filter(segment => segment !== '')

//     return (
//         <nav
//             aria-label="Breadcrumb"
//             className="absolute text-black px-4 py-0 rounded-sm backdrop-blur mt-5"
//         >
//             <ol style={{ display: 'flex', listStyle: 'none', gap: '8px' }}>
//                 <li>
//                     <Link href="/">Home</Link>
//                 </li>
//                 {pathSegments.map((segment, index) => {
//                     const href = `/${pathSegments.slice(0, index + 1).join('/')}`
//                     const isLast = index === pathSegments.length - 1

//                     return (
//                         <li key={href}>
//                             <span> {'>>'} </span>
//                             {isLast ? (
//                                 <span className="capitalize">{segment}</span>
//                             ) : (
//                                 <Link href={href} className="capitalize">
//                                     {segment}
//                                 </Link>
//                             )}
//                         </li>
//                     )
//                 })}
//             </ol>
//         </nav>
//     )
// }
