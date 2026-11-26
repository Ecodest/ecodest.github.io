export function drawReportGraph(canvas, year) {
  const context = canvas.getContext("2d");
  const width = canvas.width = 1500;
  const height = canvas.height = 660;
  context.scale(width, height);
  const curve = new Path2D();
  if (year === 2024) {
    curve.moveTo(0, .86);
    curve.bezierCurveTo(.12, .88, .17, .98, .29, .90);
    curve.bezierCurveTo(.40, .80, .47, .94, .58, .89);
    curve.bezierCurveTo(.72, .92, .80, .92, .88, .83);
    curve.bezierCurveTo(.94, .77, .97, .76, 1, .72);
  } else {
    curve.moveTo(0, .72);
    curve.bezierCurveTo(.12, .60, .18, .58, .25, .66);
    curve.bezierCurveTo(.35, .80, .44, .62, .55, .66);
    curve.bezierCurveTo(.68, .53, .74, .67, .81, .54);
    curve.bezierCurveTo(.93, .35, .94, .50, 1, .46);
  }
  context.lineWidth = .004;
  context.strokeStyle = "#26a7cf";
  const area = new Path2D(curve);
  area.lineTo(1, 1);
  area.lineTo(0, 1);
  area.closePath();
  const fill = context.createLinearGradient(0, .45, 0, 1);
  fill.addColorStop(0, "#104b62");
  fill.addColorStop(1, "#162a31");
  context.fillStyle = fill;
  context.fill(area);
  context.stroke(curve);
}
