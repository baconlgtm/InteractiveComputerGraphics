#pragma once
#include <cmath>
#include <iostream>

using std::sqrt;

class Vec3{
public:
    double x;
    double y;
    double z;

    Vec3(){
        x = 0;
        y = 0;
        z = 0;
    }

    Vec3(double input_x, double input_y, double input_z){
        x = input_x;
        y = input_y;
        z = input_z;
    }

    Vec3 operator+(const double operand) const{
        return Vec3(x + operand, y + operand, z + operand);
    }

    Vec3 operator-(const double operand) const{
        return Vec3(x - operand, y - operand, z - operand);
    }

    Vec3 operator*(const double operand) const{
        return Vec3(x * operand, y * operand, z * operand);
    }

    Vec3 operator/(const double operand) const{
        return Vec3(x / operand, y / operand, z / operand);
    }

    Vec3 operator+(const Vec3 &operand) const{
        return Vec3(x + operand.x, y + operand.y, z + operand.z);
    }

    Vec3 operator-(const Vec3 &operand) const{
        return Vec3(x - operand.x, y - operand.y, z - operand.z);
    }

    Vec3 operator*(const Vec3 &operand) const{
        return Vec3(x * operand.x, y * operand.y, z * operand.z);
    }

    double dot(const Vec3 &operand) const{
        return x * operand.x + y * operand.y + z * operand.z;
    }

    Vec3 cross(const Vec3 &operand) {
        return Vec3(y * operand.z - z * operand.y,
                    z * operand.x - x * operand.z,
                    x * operand.y - y * operand.x);
    }

    double length_squared() const {
        return x * x + y * y + z * z;
    }

    double length() const{
        return sqrt(length_squared());
    }

    Vec3 vec3_unit() const{
        double s = length();
        return Vec3(x/s, y/s, z/s);
    }

    void operator+=(const Vec3 &operand) {
        x += operand.x;
        y += operand.y;
        z += operand.z;
    }

    void operator*=(const double operand) {
        x *= operand;
        y *= operand;
        z *= operand;
    }

};

inline double dot(const Vec3 &u, const Vec3 &v) {
    return u.x * v.x + u.y * v.y + u.z * v.z;
}

inline Vec3 cross(const Vec3 &u ,const Vec3 &v) {
    return Vec3(u.y * v.z - u.z * v.y,
                u.z * v.x - u.x * v.z,
                u.x * v.y - u.y * v.x);
}

inline Vec3 negate_vec(const Vec3 &u) {
    return Vec3(-u.x, -u.y, -u.z);
}

inline Vec3 operator*(double operand, const Vec3 &v) {
    return v * operand;
}

