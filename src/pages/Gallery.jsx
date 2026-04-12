import './Gallery.css'

export default function Gallery({ galleryIndex = 0, totalDrawings = 0, onSelectDrawing }) {
  if (totalDrawings === 0) {
    return (
      <div className="gallery-page">
        <div className="gallery-info">
          <p className="gallery-empty">No drawings yet...</p>
        </div>
      </div>
    )
  }

  const current = (galleryIndex % totalDrawings) + 1

  return (
    <div className="gallery-page">
      <div className="gallery-controls">
        <button
          className="gallery-arrow"
          onClick={() => onSelectDrawing?.((galleryIndex - 1 + totalDrawings) % totalDrawings)}
        >
          &#8592;
        </button>
        <span className="gallery-counter">{current} / {totalDrawings}</span>
        <button
          className="gallery-arrow"
          onClick={() => onSelectDrawing?.((galleryIndex + 1) % totalDrawings)}
        >
          &#8594;
        </button>
      </div>
    </div>
  )
}
