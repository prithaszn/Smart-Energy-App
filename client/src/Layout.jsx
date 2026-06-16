import bg from './assets/pic1.png'

function Layout({ children }) {
  return (
    <div
      className="page-bg"
      style={{ '--bg-image': `url(${bg})` }}
    >
      <div className="page-content">
        {children}
      </div>
    </div>
  )
}

export default Layout