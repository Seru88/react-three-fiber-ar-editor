export default function LoadingScreen() {
  return (
    <div
      className='flex h-full w-full flex-col items-center justify-center'
      // style={{ height: topOffset ? `calc(100vh - ${topOffset}px)` : '100vh' }}
    >
      <div className='btn-xl loading btn-ghost no-animation btn-square btn text-primary' />
    </div>
  )
}
