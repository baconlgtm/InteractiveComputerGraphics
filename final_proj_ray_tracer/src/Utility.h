#pragma once
#include "Vec3.h"
#include "Ray.h"
#include <cmath>
#include <stdlib.h>
#include <time.h>
#include <limits>
#include <memory>

using std::shared_ptr;
using std::make_shared;
using std::sqrt;

const double max_val = std::numeric_limits<double>::infinity();
const double pi = 3.1415926535897932385;

/**
 * Change degree to rad
 */
inline double degToRad(double degrees) {
    return degrees * pi / 180.0;
}

/**
 * Clamp a value
 */
inline double clamp(double x, double min, double max) {
    if (x > max) return max;
    if (x < min) return min;
    return x;
}

/**
 * get a random double within 0 and 1
 */
inline double get_random_double() {
    return rand() / (RAND_MAX + 1.0);
}

/**
 * get a random double within min and max
 */
inline double get_random_double_min_max(double min, double max) {
    return (max - min) * get_random_double() + min;
}

/**
 * get a random vec3
 */
inline static Vec3 get_random_vec() {
    return Vec3(get_random_double(), get_random_double(), get_random_double());
}

/**
 * get a random vec3 within min and max
 */
inline static Vec3 get_random_vec_min_max(double min, double max) {
    return Vec3(get_random_double_min_max(min,max), get_random_double_min_max(min,max), get_random_double_min_max(min,max));
}

/**
 * a defocus disk of radius zero (no blur at all)
 */
Vec3 get_random_disk() {
    while (true) {
        Vec3 v = Vec3(get_random_double_min_max(-1,1), get_random_double_min_max(-1,1), 0);// may be wrong
        if (v.length_squared() < 1) return v;
    }
}

/**
 * random in unit sphere
 */
Vec3 get_random_unit_sphere() {
    while (true) {
        Vec3 v = get_random_vec_min_max(-1, 1);
        if (v.length_squared() < 1) return v;
    }
}
