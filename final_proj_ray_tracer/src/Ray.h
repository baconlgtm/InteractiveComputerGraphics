#pragma once
#include "Vec3.h"
#include <cmath>

class Ray {
public:
    Vec3 orig;
    Vec3 dir;

    Ray(){}
    Ray(Vec3 start, Vec3 direction){
        orig = start;
        dir = direction;
    }

    /**
     * Return point at t
     */
    Vec3 at(double t) const {
        return orig + t * dir;
    }
};