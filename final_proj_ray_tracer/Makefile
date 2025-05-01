# Author: Wubin Tang (wubint2@illinois.edu)
CPP = g++ -std=c++14
COMPILERFLAGS = -g -Wall -Wextra -Wno-sign-compare

LINKLIBS = -lpthread

RAYTRACEROBJECTS = obj/raytracer.o


.PHONY: all clean

all : obj raytracer

raytracer: $(RAYTRACEROBJECTS)
	$(CPP) $(COMPILERFLAGS) $^ -o $@ $(LINKLIBS)


clean :
	$(RM) obj/*.o raytracer

obj/%.o: src/%.cpp
	$(CPP) $(COMPILERFLAGS) -c -o $@ $<
obj:
	mkdir -p obj
