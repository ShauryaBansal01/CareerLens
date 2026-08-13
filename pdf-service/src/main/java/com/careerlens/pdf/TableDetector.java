package com.careerlens.pdf;

import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.graphics.image.PDImage;
import org.apache.pdfbox.contentstream.PDFGraphicsStreamEngine;

import java.awt.geom.Point2D;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Detects <em>ruled</em> tables — those drawn with visible borders — by
 * capturing the page's line-drawing operations.
 *
 * <p>Text extraction alone cannot see these: a table's contents come through as
 * ordinary text, so a resume laying out skills or experience in a bordered grid
 * looks identical to a linear one. ATS parsers frequently mangle such grids,
 * reading cells in the wrong order or merging them.
 *
 * <p>Borderless tables are deliberately <b>not</b> detected. Identifying them
 * means inferring structure from column alignment alone, which confuses an
 * ordinary two-column skills list for a table often enough that the warning
 * would cost the user more than it gains. Ruled tables cover most
 * Word-exported resumes, and the limit is honest.
 */
public class TableDetector extends PDFGraphicsStreamEngine {

    /** Segments shorter than this are ticks, underlines or artefacts. */
    private static final float MIN_SEGMENT_LENGTH = 40f;

    /** How far a segment may drift and still count as axis-aligned. */
    private static final float AXIS_TOLERANCE = 2f;

    /** A grid needs at least this many rules on each axis to be a table. */
    private static final int MIN_HORIZONTAL_RULES = 3;
    private static final int MIN_VERTICAL_RULES = 2;

    private final List<float[]> horizontals = new ArrayList<>();
    private final List<float[]> verticals = new ArrayList<>();

    private Point2D currentPoint = new Point2D.Float(0, 0);
    private Point2D subpathStart = new Point2D.Float(0, 0);

    protected TableDetector(PDPage page) {
        super(page);
    }

    public static boolean pageHasTable(PDPage page) throws IOException {
        TableDetector detector = new TableDetector(page);
        detector.processPage(page);
        return detector.looksLikeTable();
    }

    boolean looksLikeTable() {
        return horizontals.size() >= MIN_HORIZONTAL_RULES
                && verticals.size() >= MIN_VERTICAL_RULES
                && rulesIntersect();
    }

    /**
     * Parallel lines alone are not a table — a page of underlined headings would
     * qualify. Require the two axes to actually cross, forming cells.
     */
    private boolean rulesIntersect() {
        for (float[] h : horizontals) {
            float hy = h[1], hx1 = Math.min(h[0], h[2]), hx2 = Math.max(h[0], h[2]);
            for (float[] v : verticals) {
                float vx = v[0], vy1 = Math.min(v[1], v[3]), vy2 = Math.max(v[1], v[3]);
                if (vx >= hx1 - AXIS_TOLERANCE && vx <= hx2 + AXIS_TOLERANCE
                        && hy >= vy1 - AXIS_TOLERANCE && hy <= vy2 + AXIS_TOLERANCE) {
                    return true;
                }
            }
        }
        return false;
    }

    private void recordSegment(Point2D from, Point2D to) {
        float x1 = (float) from.getX(), y1 = (float) from.getY();
        float x2 = (float) to.getX(), y2 = (float) to.getY();

        float dx = Math.abs(x2 - x1);
        float dy = Math.abs(y2 - y1);

        if (dy <= AXIS_TOLERANCE && dx >= MIN_SEGMENT_LENGTH) {
            horizontals.add(new float[]{x1, y1, x2, y2});
        } else if (dx <= AXIS_TOLERANCE && dy >= MIN_SEGMENT_LENGTH) {
            verticals.add(new float[]{x1, y1, x2, y2});
        }
    }

    // ── PDFGraphicsStreamEngine ────────────────────────────────────────────

    @Override
    public void appendRectangle(Point2D p0, Point2D p1, Point2D p2, Point2D p3) {
        // Table cells are very often drawn as thin filled rectangles rather than
        // stroked lines, so treat each edge as a candidate rule.
        recordSegment(p0, p1);
        recordSegment(p1, p2);
        recordSegment(p2, p3);
        recordSegment(p3, p0);
    }

    @Override
    public void moveTo(float x, float y) {
        currentPoint = new Point2D.Float(x, y);
        subpathStart = currentPoint;
    }

    @Override
    public void lineTo(float x, float y) {
        Point2D next = new Point2D.Float(x, y);
        recordSegment(currentPoint, next);
        currentPoint = next;
    }

    @Override
    public void closePath() {
        recordSegment(currentPoint, subpathStart);
        currentPoint = subpathStart;
    }

    @Override
    public Point2D getCurrentPoint() {
        return currentPoint;
    }

    @Override
    public void curveTo(float x1, float y1, float x2, float y2, float x3, float y3) {
        // Curves are never table rules.
        currentPoint = new Point2D.Float(x3, y3);
    }

    @Override public void drawImage(PDImage pdImage) { }
    @Override public void clip(int windingRule) { }
    @Override public void strokePath() { }
    @Override public void fillPath(int windingRule) { }
    @Override public void fillAndStrokePath(int windingRule) { }
    @Override public void shadingFill(org.apache.pdfbox.cos.COSName shadingName) { }
    @Override public void endPath() { }
}
