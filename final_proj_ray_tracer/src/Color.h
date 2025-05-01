#pragma once
#include "Vec3.h"
#include "Utility.h"
#include <iostream>

/**
 * Output the pixel with rgb using gamma correct
 */
void write_color(std::ostream &out, Vec3 color_point, int samples_per_pixel) {
    auto r = color_point.x;
    auto g = color_point.y;
    auto b = color_point.z;

    // gamma-correct for gamma=2.0.
    auto s = 1.0 / samples_per_pixel;
    r = sqrt(s * r);
    g = sqrt(s * g);
    b = sqrt(s * b);

    // Write the rgb value in [0, 255]
    out << static_cast<int>(256 * clamp(r, 0.0, 0.999)) << ' '
        << static_cast<int>(256 * clamp(g, 0.0, 0.999)) << ' '
        << static_cast<int>(256 * clamp(b, 0.0, 0.999)) << '\n';
}