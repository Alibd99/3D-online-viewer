import bpy

# Define the parameters for the cylinder
radius = 1
depth = 2
location = (0, 0, 0)

def create_cylinder(radius, depth, location):
    # Create the cylinder
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=location)
    cylinder = bpy.context.object
    
    # Add a new material
    material = bpy.data.materials.new(name="CylinderMaterial")
    material.use_nodes = True
    
    # Get the material's node tree
    nodes = material.node_tree.nodes
    principled_bsdf = nodes.get("Principled BSDF")
    
    # Set the color (RGBA)
    principled_bsdf.inputs["Base Color"].default_value = (0, 1, 0, 1)  # Green color
    
    # Assign the material to the cylinder
    if cylinder.data.materials:
        cylinder.data.materials[0] = material
    else:
        cylinder.data.materials.append(material)

def export_scene(export_path):
    try:
        # Export the scene to GLB format
        bpy.ops.export_scene.gltf(filepath=export_path, export_format='GLB')
        print(f"Exported scene to {export_path}")
        return True
    except Exception as e:
        print(f"Error during export: {e}")
        return False

def perform_operations():
    # Clear existing objects
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.object.select_by_type(type='MESH')
    bpy.ops.object.delete()
    
    # Create the cylinder
    create_cylinder(radius, depth, location)
    
    # Define the export path
    export_path = "/home/alosh/projects1/exam/public/models/model.glb"
    
    # Export the scene
    return export_scene(export_path)

if __name__ == "__main__":
    result = perform_operations()
    if not result:
        print("Export failed")
